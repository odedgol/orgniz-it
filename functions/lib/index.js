"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerInterviewReminders = exports.createCustomToken = exports.sendTestNotification = exports.sendInterviewReminders = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
// Default reminder times (in hours)
const DEFAULT_FIRST_REMINDER = 24;
const DEFAULT_SECOND_REMINDER = 1;
/**
 * Helper to parse interview date (handles both Timestamp and string formats)
 * Times are assumed to be in Israel timezone (Asia/Jerusalem)
 */
function getInterviewDateTime(interview) {
    // Handle both Timestamp and string date formats
    if (interview.date && typeof interview.date.toDate === 'function') {
        // Date is a Firestore Timestamp - already has timezone info
        return interview.date.toDate();
    }
    // Date is stored as "YYYY-MM-DD" string with time as "HH:MM"
    // Parse as Israel timezone (UTC+2, or UTC+3 during DST)
    const dateStr = typeof interview.date === 'string'
        ? interview.date
        : String(interview.date);
    // Create ISO string with Israel timezone offset
    // Israel is typically UTC+2 (IST) or UTC+3 (IDT during summer)
    // For December, Israel is in standard time (UTC+2)
    const isoString = `${dateStr}T${interview.time}:00+02:00`;
    return new Date(isoString);
}
/**
 * Scheduled function that runs every 15 minutes to check for upcoming interviews
 * and send push notifications based on user preferences
 */
exports.sendInterviewReminders = functions.pubsub
    .schedule('every 15 minutes')
    .timeZone('UTC')
    .onRun(async () => {
    var _a, _b, _c;
    console.log('Running interview reminder check v2...');
    const now = new Date();
    try {
        // Get all interviews
        const interviewsSnapshot = await db.collection('interviews').get();
        const notifications = [];
        for (const doc of interviewsSnapshot.docs) {
            const interview = { id: doc.id, ...doc.data() };
            // Ensure reminderSent has the new structure
            if (!interview.reminderSent) {
                interview.reminderSent = { firstReminder: false, secondReminder: false };
            }
            // Migrate from old structure if needed
            if ('dayBefore' in interview.reminderSent || 'hourBefore' in interview.reminderSent) {
                const oldData = interview.reminderSent;
                interview.reminderSent = {
                    firstReminder: oldData.dayBefore || oldData.firstReminder || false,
                    secondReminder: oldData.hourBefore || oldData.secondReminder || false,
                };
            }
            // Get user settings for reminder times
            const userDoc = await db.collection('users').doc(interview.userId).get();
            const userData = userDoc.data();
            const notificationSettings = (_a = userData === null || userData === void 0 ? void 0 : userData.settings) === null || _a === void 0 ? void 0 : _a.notifications;
            // Check if notifications are enabled for this user
            if (notificationSettings && !notificationSettings.enabled) {
                continue; // Skip users who have disabled notifications
            }
            const firstReminderHours = (_b = notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.firstReminderHours) !== null && _b !== void 0 ? _b : DEFAULT_FIRST_REMINDER;
            const secondReminderHours = (_c = notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.secondReminderHours) !== null && _c !== void 0 ? _c : DEFAULT_SECOND_REMINDER;
            const interviewDateTime = getInterviewDateTime(interview);
            const timeUntilInterview = interviewDateTime.getTime() - now.getTime();
            const hoursUntilInterview = timeUntilInterview / (60 * 60 * 1000);
            console.log(`Interview ${interview.id}: scheduled at ${interviewDateTime.toISOString()}, ${hoursUntilInterview.toFixed(2)} hours until interview, firstReminder: ${firstReminderHours}h, secondReminder: ${secondReminderHours}h`);
            // Check for first reminder (within 15 min window of configured time)
            // Trigger if we're past the reminder time but haven't sent it yet, and interview is still in future
            if (!interview.reminderSent.firstReminder &&
                hoursUntilInterview <= firstReminderHours &&
                hoursUntilInterview > 0) {
                const jobDoc = await db.collection('jobs').doc(interview.jobId).get();
                const job = jobDoc.exists
                    ? { id: jobDoc.id, ...jobDoc.data() }
                    : null;
                notifications.push({
                    interview,
                    job,
                    type: 'firstReminder',
                    hoursLabel: formatHoursLabel(hoursUntilInterview),
                });
            }
            // Check for second reminder
            // Each reminder fires independently when its time threshold is reached
            if (!interview.reminderSent.secondReminder &&
                hoursUntilInterview <= secondReminderHours &&
                hoursUntilInterview > 0) {
                const jobDoc = await db.collection('jobs').doc(interview.jobId).get();
                const job = jobDoc.exists
                    ? { id: jobDoc.id, ...jobDoc.data() }
                    : null;
                notifications.push({
                    interview,
                    job,
                    type: 'secondReminder',
                    hoursLabel: formatHoursLabel(hoursUntilInterview),
                });
            }
        }
        console.log(`Found ${notifications.length} notifications to send`);
        // Send notifications
        for (const { interview, job, type, hoursLabel } of notifications) {
            await sendNotification(interview, job, type, hoursLabel);
        }
        return null;
    }
    catch (error) {
        console.error('Error in sendInterviewReminders:', error);
        return null;
    }
});
/**
 * Format hours into a readable label
 */
function formatHoursLabel(hours) {
    if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return minutes <= 1 ? '1 minute' : `${minutes} minutes`;
    }
    else if (hours < 2) {
        return '1 hour';
    }
    else if (hours < 24) {
        return `${Math.round(hours)} hours`;
    }
    else if (hours < 48) {
        return '1 day';
    }
    else {
        const days = Math.round(hours / 24);
        return `${days} days`;
    }
}
/**
 * Send a push notification to all user devices
 */
async function sendNotification(interview, job, type, hoursLabel) {
    const companyName = (job === null || job === void 0 ? void 0 : job.company) || 'Company';
    const jobTitle = (job === null || job === void 0 ? void 0 : job.title) || 'Position';
    const interviewType = interview.type.charAt(0).toUpperCase() + interview.type.slice(1);
    const title = `Interview in ${hoursLabel} - ${companyName}`;
    const body = `Your ${interviewType} interview for ${jobTitle} is at ${interview.time}. ${type === 'secondReminder' ? 'Good luck!' : 'Get ready!'}`;
    // Get user's FCM tokens
    const tokensSnapshot = await db
        .collection('users')
        .doc(interview.userId)
        .collection('fcmTokens')
        .get();
    if (tokensSnapshot.empty) {
        console.log(`No FCM tokens found for user ${interview.userId}`);
        return;
    }
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
    const message = {
        tokens,
        notification: {
            title,
            body,
        },
        data: {
            interviewId: interview.id,
            jobId: interview.jobId,
            type,
            url: '/jobs',
        },
        webpush: {
            fcmOptions: {
                link: '/jobs',
            },
            notification: {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                requireInteraction: true,
            },
        },
    };
    try {
        const response = await messaging.sendEachForMulticast(message);
        console.log(`Sent ${type} reminder for interview ${interview.id}: ${response.successCount} success, ${response.failureCount} failures`);
        // Clean up invalid tokens
        const tokensToDelete = [];
        response.responses.forEach((resp, idx) => {
            var _a;
            if (!resp.success) {
                const errorCode = (_a = resp.error) === null || _a === void 0 ? void 0 : _a.code;
                if (errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered') {
                    tokensToDelete.push(tokens[idx]);
                }
            }
        });
        // Delete invalid tokens
        for (const token of tokensToDelete) {
            const tokenQuery = await db
                .collection('users')
                .doc(interview.userId)
                .collection('fcmTokens')
                .where('token', '==', token)
                .get();
            for (const tokenDoc of tokenQuery.docs) {
                await tokenDoc.ref.delete();
                console.log(`Deleted invalid token: ${token.substring(0, 20)}...`);
            }
        }
        // Update reminder sent flag
        await db.collection('interviews').doc(interview.id).update({
            [`reminderSent.${type}`]: true,
        });
    }
    catch (error) {
        console.error(`Error sending notification for interview ${interview.id}:`, error);
    }
}
/**
 * HTTP function to manually trigger a test notification (for development)
 */
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
    console.log('[sendTestNotification] Starting...');
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    console.log('[sendTestNotification] User ID:', userId);
    const { title, body } = data;
    // Get user's FCM tokens
    const tokensSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('fcmTokens')
        .get();
    console.log('[sendTestNotification] Found', tokensSnapshot.size, 'tokens');
    if (tokensSnapshot.empty) {
        throw new functions.https.HttpsError('failed-precondition', 'No FCM tokens found. Please enable notifications first.');
    }
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
    console.log('[sendTestNotification] Token prefixes:', tokens.map(t => t.substring(0, 20) + '...'));
    const message = {
        tokens,
        notification: {
            title: title || 'Test Notification',
            body: body || 'This is a test notification from Orgniz-it!',
        },
        data: {
            type: 'test',
        },
        webpush: {
            notification: {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
            },
        },
    };
    console.log('[sendTestNotification] Sending message...');
    const response = await messaging.sendEachForMulticast(message);
    console.log('[sendTestNotification] Response:', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses.map((r, i) => {
            var _a;
            return ({
                success: r.success,
                error: (_a = r.error) === null || _a === void 0 ? void 0 : _a.message,
                messageId: r.messageId
            });
        })
    });
    return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
    };
});
/**
 * Create a custom token for Electron app authentication
 * This allows the Electron app to sign in after user authenticates in browser
 */
exports.createCustomToken = functions.https.onCall(async (data, context) => {
    console.log('[createCustomToken] Starting...');
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    console.log('[createCustomToken] Creating custom token for user:', userId);
    try {
        // Create a custom token for this user
        const customToken = await admin.auth().createCustomToken(userId);
        console.log('[createCustomToken] Custom token created successfully');
        return {
            customToken,
        };
    }
    catch (error) {
        console.error('[createCustomToken] Error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
/**
 * HTTP function to manually trigger interview reminders check (for testing)
 */
exports.triggerInterviewReminders = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    console.log('[triggerInterviewReminders] Starting manual trigger...');
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const now = new Date();
    try {
        // Get user's interviews
        const interviewsSnapshot = await db
            .collection('interviews')
            .where('userId', '==', userId)
            .get();
        // Get user settings
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const notificationSettings = (_a = userData === null || userData === void 0 ? void 0 : userData.settings) === null || _a === void 0 ? void 0 : _a.notifications;
        const firstReminderHours = (_b = notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.firstReminderHours) !== null && _b !== void 0 ? _b : DEFAULT_FIRST_REMINDER;
        const secondReminderHours = (_c = notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.secondReminderHours) !== null && _c !== void 0 ? _c : DEFAULT_SECOND_REMINDER;
        const results = [];
        for (const doc of interviewsSnapshot.docs) {
            const interview = { id: doc.id, ...doc.data() };
            // Parse date
            let interviewDate;
            if (typeof interview.date === 'string') {
                interviewDate = new Date(interview.date + 'T00:00:00');
            }
            else if (interview.date && typeof interview.date.toDate === 'function') {
                interviewDate = interview.date.toDate();
            }
            else {
                interviewDate = new Date(interview.date);
            }
            const [hours, minutes] = interview.time.split(':').map(Number);
            interviewDate.setHours(hours, minutes, 0, 0);
            const timeUntilInterview = interviewDate.getTime() - now.getTime();
            const hoursUntilInterview = timeUntilInterview / (60 * 60 * 1000);
            const reminderSent = interview.reminderSent || { firstReminder: false, secondReminder: false };
            results.push({
                interviewId: interview.id,
                interviewTime: interviewDate.toISOString(),
                hoursUntil: Math.round(hoursUntilInterview * 100) / 100,
                firstReminderDue: hoursUntilInterview <= firstReminderHours && hoursUntilInterview > 0,
                secondReminderDue: hoursUntilInterview <= secondReminderHours && hoursUntilInterview > 0,
                firstReminderSent: reminderSent.firstReminder || false,
                secondReminderSent: reminderSent.secondReminder || false,
            });
        }
        return {
            now: now.toISOString(),
            settings: {
                firstReminderHours,
                secondReminderHours,
                notificationsEnabled: (_d = notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.enabled) !== null && _d !== void 0 ? _d : true,
            },
            interviews: results,
        };
    }
    catch (error) {
        console.error('[triggerInterviewReminders] Error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=index.js.map