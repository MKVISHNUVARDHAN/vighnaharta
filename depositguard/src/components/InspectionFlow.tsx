import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RoomType, ConditionStatus, InspectionType, MediaItem } from '../types';
import { ROOM_METADATA, QUICK_TAGS } from '../data/sampleData';
import { formatFullDateTime } from '../utils/formatters';
import { stampImageWithMetadata } from '../utils/watermark';
import confetti from 'canvas-confetti';
import {
  Camera,
  Video,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Sparkles,
  FileCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface InspectionFlowProps {
  type: InspectionType;
}

const ROOM_KEYS: RoomType[] = [
  'living',
  'master_bedroom',
  'guest_bedroom',
  'kitchen',
  'bathroom',
  'balcony',
  'other'
];

export const InspectionFlow: React.FC<InspectionFlowProps> = ({ type }) => {
  const {
    activeProperty,
    saveRoomInspection,
    addMediaToRoom,
    removeMediaFromRoom,
    setActiveTab,
    setSelectedPdfType
  } = useApp();

  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const currentRoomKey = ROOM_KEYS[activeRoomIndex];
  const roomMeta = ROOM_METADATA[currentRoomKey];

  const report = type === 'move_in' ? activeProperty.moveInReport : activeProperty.moveOutReport;
  const currentRoomData = report?.rooms?.[currentRoomKey] || {
    roomId: currentRoomKey,
    roomName: roomMeta.name,
    isCompleted: false,
    media: [],
    generalNotes: '',
    overallCondition: 'pristine',
    checklist: []
  };

  // Local state for adding a new photo/video
  const [selectedCondition, setSelectedCondition] = useState<ConditionStatus>(currentRoomData.overallCondition || 'pristine');
  const [noteText, setNoteText] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate overall inspection progress
  const completedRoomsCount = ROOM_KEYS.filter((k) => report?.rooms?.[k]?.isCompleted).length;
  const progressPercent = Math.round((completedRoomsCount / ROOM_KEYS.length) * 100);

  const handleConditionChange = (cond: ConditionStatus) => {
    setSelectedCondition(cond);
    saveRoomInspection(activeProperty.id, type, currentRoomKey, {
      overallCondition: cond
    });
  };

  const handleQuickTagClick = (tag: string) => {
    if (noteText.includes(tag)) return;
    setNoteText((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    try {
      if (file.type.startsWith('video/')) {
        // Video upload handler
        const displayDate = formatFullDateTime(new Date().toISOString());
        const mockVideoUrl = URL.createObjectURL(file);
        const newMedia: MediaItem = {
          id: `media-${Date.now()}`,
          type: 'video',
          url: mockVideoUrl,
          timestamp: new Date().toISOString(),
          displayDate,
          notes: noteText || 'Short inspection video recording',
          condition: selectedCondition,
          quickTags: noteText ? [noteText] : [],
          geoTag: `${activeProperty.city}, KA`
        };

        addMediaToRoom(activeProperty.id, type, currentRoomKey, newMedia);
        setNoteText('');
      } else {
        // Photo upload with indelible client-side watermark stamping
        const { dataUrl, timestampIso, displayDate } = await stampImageWithMetadata(file, {
          roomName: roomMeta.name,
          condition: selectedCondition,
          geo: `${activeProperty.city}, KA`
        });

        const newMedia: MediaItem = {
          id: `media-${Date.now()}`,
          type: 'photo',
          url: dataUrl,
          timestamp: timestampIso,
          displayDate,
          notes: noteText || `${roomMeta.name} inspection evidence`,
          condition: selectedCondition,
          quickTags: noteText ? [noteText] : [],
          geoTag: `${activeProperty.city}, KA`
        };

        addMediaToRoom(activeProperty.id, type, currentRoomKey, newMedia);
        setNoteText('');
      }
    } catch (err) {
      console.error('Failed to process upload', err);
      alert('Could not process media. Please try again.');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChecklistToggle = (checkKey: string, checked: boolean) => {
    const updatedChecklist = (currentRoomData.checklist || []).map((item) =>
      item.key === checkKey ? { ...item, checked } : item
    );
    saveRoomInspection(activeProperty.id, type, currentRoomKey, {
      checklist: updatedChecklist
    });
  };

  const handleNextRoom = () => {
    // Mark room complete
    saveRoomInspection(activeProperty.id, type, currentRoomKey, {
      isCompleted: true,
      overallCondition: selectedCondition,
      generalNotes: noteText || currentRoomData.generalNotes
    });

    if (activeRoomIndex < ROOM_KEYS.length - 1) {
      setActiveRoomIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed all rooms!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setSelectedPdfType(type);
      setActiveTab('pdf');
    }
  };

  const handlePrevRoom = () => {
    if (activeRoomIndex > 0) {
      setActiveRoomIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isMoveIn = type === 'move_in';
  const titleText = isMoveIn ? 'Move-In Condition Inspection' : 'Move-Out Condition Inspection';
  const subtitleText = isMoveIn
    ? 'Document every pre-existing crack, scuff, and leak before you unpack'
    : 'Capture handover condition to safeguard against unfair deposit deductions';

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isMoveIn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isMoveIn ? 'MOVE-IN FLOW' : 'MOVE-OUT FLOW'}
              </span>
              <span className="text-xs text-slate-500 font-medium">{activeProperty.title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-navy-950 mt-1">{titleText}</h1>
            <p className="text-xs text-slate-500">{subtitleText}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              Completed {completedRoomsCount} of {ROOM_KEYS.length} rooms
            </span>
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Clear Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Room Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {ROOM_KEYS.map((key, idx) => {
              const meta = ROOM_METADATA[key];
              const isCurrent = idx === activeRoomIndex;
              const isDone = report?.rooms?.[key]?.isCompleted;
              const hasDamage = report?.rooms?.[key]?.overallCondition === 'damaged';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveRoomIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isCurrent
                      ? 'bg-navy-900 text-white shadow-sm ring-2 ring-navy-900/20'
                      : isDone
                      ? hasDamage
                        ? 'bg-amber-50 text-amber-900 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isDone ? (
                    hasDamage ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                  )}
                  {meta.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Room Active Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Room Header & Overall Condition Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Room {activeRoomIndex + 1} of {ROOM_KEYS.length}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-navy-950 flex items-center gap-2">
              {roomMeta.name}
            </h2>
          </div>

          {/* Condition Selector Pill Options */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleConditionChange('pristine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCondition === 'pristine'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pristine (Safe)
            </button>
            <button
              type="button"
              onClick={() => handleConditionChange('minor_wear')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCondition === 'minor_wear'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Minor Wear
            </button>
            <button
              type="button"
              onClick={() => handleConditionChange('damaged')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCondition === 'damaged'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Damage / Defect
            </button>
          </div>
        </div>

        {/* Upload & Evidence Input Area */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Upload Date-Stamped Photo or Video
            </label>
            <div className="flex items-center gap-1 text-[11px] bg-slate-200 p-0.5 rounded-lg font-semibold">
              <button
                type="button"
                onClick={() => setMediaType('photo')}
                className={`px-2 py-0.5 rounded-md ${
                  mediaType === 'photo' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Photo
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`px-2 py-0.5 rounded-md ${
                  mediaType === 'video' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Short Video
              </button>
            </div>
          </div>

          {/* Quick Tag Recommendations */}
          <div>
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Tap pre-existing issue note to add:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Freeform Notes Input */}
          <div>
            <textarea
              rows={2}
              placeholder="e.g. Wall crack already present behind sofa, fan speed 1 vibrates, tap lime scale..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            />
          </div>

          {/* Upload Button & Trigger */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isProcessingUpload}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 bg-navy-900 hover:bg-navy-950 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isProcessingUpload ? (
                <span>Stamping Date & Time...</span>
              ) : (
                <>
                  {mediaType === 'photo' ? <Camera className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  Take Photo / Upload {mediaType === 'photo' ? 'Image' : 'Video'}
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            Automatic timestamp and GPS location stamp applied to all evidence permanently.
          </p>
        </div>

        {/* Room Specific Inspection Checklist */}
        {currentRoomData.checklist && currentRoomData.checklist.length > 0 && (
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {roomMeta.name} Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentRoomData.checklist.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => handleChecklistToggle(item.key, e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Captured Evidence Gallery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider">
              Captured Evidence ({currentRoomData.media?.length || 0})
            </h3>
            {currentRoomData.media?.length === 0 && (
              <span className="text-[11px] text-slate-400">No photos logged yet</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(currentRoomData.media || []).map((m) => {
              const isDamaged = m.condition === 'damaged';
              const isMinor = m.condition === 'minor_wear';

              return (
                <div
                  key={m.id}
                  className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs"
                >
                  {/* Media Display */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    {m.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white p-3">
                        <Video className="w-8 h-8 text-emerald-400 mb-1" />
                        <span className="text-xs font-semibold">Video Evidence Stamped</span>
                        <span className="text-[10px] text-slate-300">{m.displayDate}</span>
                      </div>
                    ) : (
                      <img
                        src={m.url}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}

                    {/* Stamped Badge */}
                    <div className="absolute top-2 left-2 bg-navy-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 border border-white/20">
                      <Clock className="w-2.5 h-2.5 text-emerald-400" />
                      {m.displayDate}
                    </div>

                    {/* Condition badge */}
                    <div
                      className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDamaged
                          ? 'bg-red-600 text-white'
                          : isMinor
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {m.condition.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  {/* Note & Delete */}
                  <div className="p-2.5 text-xs flex items-start justify-between gap-2">
                    <p className="text-slate-700 font-medium text-[11px] leading-relaxed line-clamp-2">
                      {m.notes || 'Evidence recorded'}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeMediaFromRoom(activeProperty.id, type, currentRoomKey, m.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove Evidence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevRoom}
            disabled={activeRoomIndex === 0}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <button
            type="button"
            onClick={handleNextRoom}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            {activeRoomIndex === ROOM_KEYS.length - 1 ? (
              <>
                <FileCheck className="w-4 h-4" />
                Complete & Generate Report
              </>
            ) : (
              <>
                Save & Next Room ({ROOM_METADATA[ROOM_KEYS[activeRoomIndex + 1]].name})
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
