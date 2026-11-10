'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { fetchApi } from '@/lib/api';
import { DeliveryTaskStage, DeliveryTaskStatus, RoleType } from '@borrowed/types';
import { format } from 'date-fns';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ShieldCheck,
  Send,
  Navigation,
} from 'lucide-react';

export default function DeliveryCourierPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [statusInput, setStatusInput] = useState<DeliveryTaskStatus>(DeliveryTaskStatus.COMPLETED);
  const [proofNotes, setProofNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');

  const fetchTasks = () => {
    setLoading(true);
    fetchApi('/delivery/my-tasks')
      .then((data) => setTasks(data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string) => {
    setSubmitting(true);
    try {
      await fetchApi(`/delivery/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: statusInput,
          proofNotes: proofNotes || 'Confirmed by courier in person',
        }),
      });
      setSelectedTask(null);
      setProofNotes('');
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeStageFilter === 'ALL') return true;
    return t.stage === activeStageFilter;
  });

  const getStageBadge = (stage: DeliveryTaskStage) => {
    switch (stage) {
      case DeliveryTaskStage.PICKUP_FROM_OWNER:
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">Stage 1: Pickup from Owner</span>;
      case DeliveryTaskStage.DELIVER_TO_RENTER:
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">Stage 2: Deliver to Renter (3d Early)</span>;
      case DeliveryTaskStage.COLLECT_FROM_RENTER:
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">Stage 3: Return Collection</span>;
      case DeliveryTaskStage.RETURN_TO_OWNER:
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Stage 4: Return to Owner</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-taupe/20 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-sage">
              Dedicated Courier Logistics Fleet
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-onyx font-editorial">
            Courier Dispatch Console
          </h1>
          <p className="text-xs text-onyx/60 mt-0.5">
            Logged in as Courier {user?.firstName} {user?.lastName} ({user?.phoneNumber || '+201009990000'})
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-onyx text-ivory text-xs font-semibold rounded-lg hover:bg-darkbrown transition-colors self-start sm:self-auto"
        >
          Refresh Routes
        </button>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'ALL', label: 'All Tasks' },
          { key: DeliveryTaskStage.PICKUP_FROM_OWNER, label: 'Owner Pickups' },
          { key: DeliveryTaskStage.DELIVER_TO_RENTER, label: 'Renter Dropoffs' },
          { key: DeliveryTaskStage.COLLECT_FROM_RENTER, label: 'Return Collections' },
          { key: DeliveryTaskStage.RETURN_TO_OWNER, label: 'Owner Returns' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveStageFilter(btn.key)}
            className={`px-3 py-1.5 rounded-full font-semibold border transition-all whitespace-nowrap ${
              activeStageFilter === btn.key
                ? 'bg-onyx text-ivory border-onyx'
                : 'bg-white border-taupe/30 text-onyx/70 hover:border-taupe'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Tasks Queue */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-luxury animate-pulse border border-taupe/20" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-luxury text-center border border-taupe/30 space-y-3">
          <Truck className="w-10 h-10 text-taupe mx-auto" />
          <h3 className="text-lg font-bold text-onyx font-editorial">No Assigned Tasks in This Queue</h3>
          <p className="text-xs text-onyx/60">New booking delivery legs will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isDone = task.status === DeliveryTaskStatus.COMPLETED;
            return (
              <div
                key={task.id}
                className={`bg-white p-6 rounded-luxury border transition-all space-y-4 ${
                  isDone ? 'border-taupe/20 opacity-80' : 'border-onyx/30 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-taupe/15">
                  <div className="flex items-center gap-2">
                    {getStageBadge(task.stage)}
                    <span className="text-xs font-mono font-bold text-onyx">
                      {task.rentalBooking?.bookingReference}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-4 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-onyx/50">Garment</p>
                    <p className="font-bold text-onyx">{task.rentalBooking?.dress?.title}</p>
                    <p className="text-onyx/60">{task.rentalBooking?.dress?.brand}</p>
                  </div>

                  <div className="md:col-span-5 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-onyx/50">Target Destination</p>
                    <p className="font-semibold text-onyx flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-darkbrown flex-shrink-0 mt-0.5" />
                      <span>{task.targetAddress}</span>
                    </p>
                    <p className="text-onyx/70 flex items-center gap-1.5 pt-1">
                      <Phone className="w-3 h-3 text-sage" />
                      <span>{task.contactName} ({task.contactPhone})</span>
                    </p>
                  </div>

                  <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end gap-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-onyx/50">Scheduled Date</p>
                      <p className="font-bold text-onyx">
                        {format(new Date(task.scheduledDate), 'MMM d, yyyy')}
                      </p>
                    </div>

                    {!isDone ? (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-4 py-2 bg-onyx text-ivory text-xs font-bold rounded-lg hover:bg-darkbrown transition-colors shadow-sm"
                      >
                        Update Status & Proof
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {task.proofNotes && (
                  <div className="p-2.5 rounded bg-ivory text-[11px] text-onyx/75 border border-taupe/20">
                    <span className="font-bold text-onyx">Courier Log:</span> {task.proofNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Dialog to Update Status */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-onyx/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-luxury-lg max-w-lg w-full p-6 space-y-6 shadow-2xl border border-taupe/40 animate-in fade-in">
            <div className="pb-3 border-b border-taupe/20">
              <span className="text-[10px] uppercase font-bold text-sage block">
                Logistics Status Transition
              </span>
              <h3 className="text-xl font-bold font-editorial text-onyx">
                Update Task #{selectedTask.id.slice(0, 8)}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-onyx block">New Task Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as DeliveryTaskStatus)}
                  className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx font-bold cursor-pointer"
                >
                  <option value={DeliveryTaskStatus.IN_PROGRESS}>In Progress / Driver on the Way</option>
                  <option value={DeliveryTaskStatus.COMPLETED}>Completed (Successfully Handed Over)</option>
                  <option value={DeliveryTaskStatus.FAILED}>Delivery Failed (Recipient Unavailable)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-onyx block">Delivery Proof & Garment Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Received garment in pristine dustbag, confirmed with Yasmin in person."
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="w-full p-2.5 bg-ivory border border-taupe/40 rounded-lg text-onyx"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-onyx/60 hover:text-onyx"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdateStatus(selectedTask.id)}
                className="px-6 py-2.5 bg-onyx text-ivory text-xs font-bold rounded-lg hover:bg-darkbrown transition-colors shadow-md"
              >
                {submitting ? 'Updating...' : 'Submit Transition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

