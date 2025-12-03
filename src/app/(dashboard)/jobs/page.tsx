'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Label,
  Textarea,
  Select,
} from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { JOB_STATUS_COLORS, INTERVIEW_TYPE_LABELS } from '@/types';
import type { Job, JobStatus, InterviewType } from '@/types';
import { Timestamp } from 'firebase/firestore';

const TABS: { id: JobStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
];

export default function JobsPage() {
  const { user } = useAuthStore();
  const { jobs, addJob, updateJob, deleteJob } = useJobStore();
  const { interviews, addInterview, deleteInterview } = useInterviewStore();

  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState<Job | null>(null);

  // Job form state
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<JobStatus>('wishlist');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Interview form state
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewType, setInterviewType] = useState<InterviewType>('phone');
  const [interviewer, setInterviewer] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  const filteredJobs = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  const openAddJobModal = () => {
    setEditingJob(null);
    setCompany('');
    setTitle('');
    setStatus('wishlist');
    setLocation('');
    setSalaryMin('');
    setSalaryMax('');
    setUrl('');
    setNotes('');
    setIsJobModalOpen(true);
  };

  const openEditJobModal = (job: Job) => {
    setEditingJob(job);
    setCompany(job.company);
    setTitle(job.title);
    setStatus(job.status);
    setLocation(job.location || '');
    setSalaryMin(job.salaryMin?.toString() || '');
    setSalaryMax(job.salaryMax?.toString() || '');
    setUrl(job.url || '');
    setNotes(job.notes || '');
    setIsJobModalOpen(true);
  };

  const openInterviewModal = (job: Job) => {
    setSelectedJobForInterview(job);
    setInterviewDate('');
    setInterviewTime('10:00');
    setInterviewType('phone');
    setInterviewer('');
    setInterviewNotes('');
    setIsInterviewModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const jobData = {
      company,
      title,
      status,
      location: location || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      url: url || undefined,
      notes: notes || undefined,
    };

    if (editingJob) {
      await updateJob(editingJob.id, jobData);
    } else {
      await addJob({
        ...jobData,
        userId: user.id,
        appliedDate: status !== 'wishlist' ? Timestamp.now() : undefined,
      });
    }
    setIsJobModalOpen(false);
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJobForInterview) return;

    await addInterview({
      userId: user.id,
      jobId: selectedJobForInterview.id,
      date: Timestamp.fromDate(new Date(interviewDate)),
      time: interviewTime,
      type: interviewType,
      interviewer: interviewer || undefined,
      notes: interviewNotes || undefined,
    });

    // Update job status to interview if not already
    if (selectedJobForInterview.status !== 'interview' && selectedJobForInterview.status !== 'offer') {
      await updateJob(selectedJobForInterview.id, { status: 'interview' });
    }

    setIsInterviewModalOpen(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      // Delete associated interviews
      const jobInterviews = interviews.filter((i) => i.jobId === jobId);
      for (const interview of jobInterviews) {
        await deleteInterview(interview.id);
      }
      await deleteJob(jobId);
    }
  };

  const getJobInterviews = (jobId: string) => {
    return interviews.filter((i) => i.jobId === jobId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Job Applications</h1>
          <p className="text-text-secondary mt-1">Pipeline management for your career</p>
        </div>
        <Button onClick={openAddJobModal}>
          <Plus size={16} className="mr-2" /> Track Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-bg-active">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-bg-tertiary text-text-primary border border-bg-active'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-50 bg-bg-primary px-1.5 py-0.5 rounded">
              {tab.id === 'all' ? jobs.length : jobs.filter((j) => j.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-bg-active rounded-xl text-text-muted">
            <Search size={32} className="mx-auto mb-4 opacity-50" />
            <p>No jobs found in this stage.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const jobInterviews = getJobInterviews(job.id);
            return (
              <Card
                key={job.id}
                className="hover:border-accent-blue/30 transition-all group relative pl-6 overflow-hidden"
              >
                {/* Status Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: JOB_STATUS_COLORS[job.status] }}
                />

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      {job.company}
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noreferrer">
                          <ExternalLink
                            size={14}
                            className="text-text-muted hover:text-accent-blue cursor-pointer"
                          />
                        </a>
                      )}
                    </h3>
                    <p className="text-text-secondary font-medium">{job.title}</p>

                    <div className="flex items-center gap-4 text-xs text-text-tertiary mt-3">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {job.location}
                        </span>
                      )}
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} />
                          {job.salaryMin && job.salaryMax
                            ? `$${job.salaryMin}k - $${job.salaryMax}k`
                            : job.salaryMin
                            ? `$${job.salaryMin}k+`
                            : `Up to $${job.salaryMax}k`}
                        </span>
                      )}
                      {job.appliedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Applied{' '}
                          {format(
                            job.appliedDate?.toDate?.() || new Date(job.appliedDate as any),
                            'MMM d'
                          )}
                        </span>
                      )}
                    </div>

                    {/* Interviews */}
                    {jobInterviews.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-bg-active">
                        <p className="text-xs text-text-secondary mb-2">Scheduled Interviews:</p>
                        <div className="flex flex-wrap gap-2">
                          {jobInterviews.map((interview) => (
                            <span
                              key={interview.id}
                              className="text-xs bg-accent-orange/10 text-accent-orange px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Clock size={10} />
                              {format(
                                interview.date?.toDate?.() || new Date(interview.date as any),
                                'MMM d'
                              )}{' '}
                              {interview.time} - {INTERVIEW_TYPE_LABELS[interview.type]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Badge
                      color={JOB_STATUS_COLORS[job.status]}
                      className="uppercase tracking-wider"
                    >
                      {job.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInterviewModal(job)}
                        title="Schedule Interview"
                      >
                        <Calendar size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditJobModal(job)}
                        title="Edit Job"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-accent-red"
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Job Modal */}
      <Modal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        title={editingJob ? 'Edit Job' : 'Track New Job'}
      >
        <form onSubmit={handleSaveJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Vercel"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                <option value="wishlist">Wishlist</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin">Salary Min ($k)</Label>
              <Input
                id="salaryMin"
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 150"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Salary Max ($k)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g. 200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="url">Job URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral details, tech stack, etc."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingJob ? 'Save Changes' : 'Track Job'}</Button>
          </div>
        </form>
      </Modal>

      {/* Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title={`Schedule Interview - ${selectedJobForInterview?.company}`}
      >
        <form onSubmit={handleSaveInterview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interviewDate">Date</Label>
              <Input
                id="interviewDate"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="interviewTime">Time</Label>
              <Input
                id="interviewTime"
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="interviewType">Interview Type</Label>
            <Select
              id="interviewType"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as InterviewType)}
            >
              <option value="phone">Phone Screen</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="onsite">Onsite</option>
              <option value="final">Final Round</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="interviewer">Interviewer (optional)</Label>
            <Input
              id="interviewer"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="e.g. John Smith"
            />
          </div>

          <div>
            <Label htmlFor="interviewNotes">Notes (optional)</Label>
            <Textarea
              id="interviewNotes"
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Topics to prepare, questions to ask, etc."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsInterviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Schedule Interview</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
