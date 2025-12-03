import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Badge, Button, Modal, Input, Label, Textarea } from '../components/ui/Components';
import { MapPin, DollarSign, Calendar, ExternalLink, Edit2, Plus, Search } from 'lucide-react';
import { JobStatus, Job } from '../types';
import { format } from 'date-fns';

const Jobs = () => {
  const { jobs, addJob, updateJob } = useStore();
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<JobStatus>('wishlist');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
  
  const statusColors: Record<JobStatus, string> = {
    wishlist: '#A1A1A6',
    applied: '#5E6AD2',
    screening: '#22D3EE',
    interview: '#F59E0B',
    offer: '#3DCC79',
    rejected: '#EF4444'
  };

  const tabs: { id: JobStatus | 'all', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'applied', label: 'Applied' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
  ];

  const openAddModal = () => {
    setEditingJob(null);
    setCompany('');
    setTitle('');
    setStatus('wishlist');
    setLocation('');
    setSalary('');
    setUrl('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setCompany(job.company);
    setTitle(job.title);
    setStatus(job.status);
    setLocation(job.location);
    setSalary(job.salary || '');
    setUrl(job.url || '');
    setNotes(job.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingJob) {
      updateJob({
        ...editingJob,
        company,
        title,
        status,
        location,
        salary,
        url,
        notes
      });
    } else {
      addJob({
        company,
        title,
        status,
        location,
        salary,
        url,
        notes,
        appliedDate: format(new Date(), 'yyyy-MM-dd')
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-[#FAFAFA]">Job Applications</h1>
                <p className="text-[#A1A1A6] mt-1">Pipeline management for your career</p>
            </div>
            <Button onClick={openAddModal}>
                <Plus size={16} className="mr-2" /> Track Job
            </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-[#2A2A30]">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                        ${filter === tab.id 
                            ? 'bg-[#1C1C1F] text-[#FAFAFA] border border-[#2A2A30]' 
                            : 'text-[#6B6B70] hover:text-[#A1A1A6] hover:bg-[#141416]'}
                    `}
                >
                    {tab.label} 
                    <span className="ml-2 text-xs opacity-50 bg-[#0A0A0B] px-1.5 py-0.5 rounded">
                        {tab.id === 'all' ? jobs.length : jobs.filter(j => j.status === tab.id).length}
                    </span>
                </button>
            ))}
        </div>

        {/* Job List */}
        <div className="space-y-4">
            {filteredJobs.map(job => (
                <Card key={job.id} className="hover:border-[#5E6AD2]/30 transition-all group relative pl-6 overflow-hidden">
                    {/* Status Strip */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5" 
                        style={{ backgroundColor: statusColors[job.status] }} 
                    />

                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                                {job.company}
                                {job.url && (
                                    <a href={job.url} target="_blank" rel="noreferrer">
                                        <ExternalLink size={14} className="text-[#4A4A4F] hover:text-[#5E6AD2] cursor-pointer" />
                                    </a>
                                )}
                            </h3>
                            <p className="text-[#A1A1A6] font-medium">{job.title}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-[#6B6B70] mt-3">
                                {job.location && (
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                )}
                                {job.salary && (
                                    <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                                )}
                                <span className="flex items-center gap-1"><Calendar size={12} /> Applied {job.appliedDate}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <Badge color={statusColors[job.status]} className="uppercase tracking-wider">
                                {job.status}
                            </Badge>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[#A1A1A6] hover:text-[#FAFAFA]"
                                onClick={() => openEditModal(job)}
                            >
                                <Edit2 size={16} />
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            
            {filteredJobs.length === 0 && (
                <div className="text-center py-20 border border-dashed border-[#2A2A30] rounded-xl text-[#4A4A4F]">
                    <Search size={32} className="mx-auto mb-4 opacity-50" />
                    <p>No jobs found in this stage.</p>
                </div>
            )}
        </div>

        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingJob ? 'Edit Job' : 'Track New Job'}
        >
            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="company">Company</Label>
                        <Input 
                            id="company" 
                            value={company} 
                            onChange={e => setCompany(e.target.value)} 
                            placeholder="e.g. Vercel" 
                            required 
                        />
                    </div>
                    <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input 
                            id="title" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. Frontend Engineer" 
                            required 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select 
                            id="status"
                            value={status}
                            onChange={e => setStatus(e.target.value as JobStatus)}
                            className="w-full bg-[#141416] border border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#5E6AD2] transition-colors appearance-none"
                        >
                            <option value="wishlist">Wishlist</option>
                            <option value="applied">Applied</option>
                            <option value="screening">Screening</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                            id="location" 
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            placeholder="e.g. Remote" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input 
                            id="salary" 
                            value={salary} 
                            onChange={e => setSalary(e.target.value)} 
                            placeholder="e.g. $150k - $180k" 
                        />
                    </div>
                    <div>
                        <Label htmlFor="url">Job URL</Label>
                        <Input 
                            id="url" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            placeholder="https://..." 
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                        id="notes" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        placeholder="Referral details, tech stack, etc." 
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingJob ? 'Save Changes' : 'Track Job'}</Button>
                </div>
            </form>
        </Modal>
    </div>
  );
};

export default Jobs;