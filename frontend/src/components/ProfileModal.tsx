import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Upload, 
  Trash2, 
  Camera, 
  School, 
  BookOpen, 
  Mail, 
  User as UserIcon, 
  Check, 
  Sparkles,
  Smile
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset avatars for students
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, updateAvatar } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
  };

  const handleSelectPreset = (url: string) => {
    setAvatarPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        university: university.trim(),
        department: department.trim(),
        bio: bio.trim(),
        avatarUrl: avatarPreview
      });
      await updateAvatar(avatarPreview);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Student Profile</h3>
              <p className="text-xs text-slate-400">Manage your avatar & academic details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Upload / Remove Section */}
        <div className="my-6 p-4 rounded-2xl glass-card flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-500 shadow-xl">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-all"
              title="Upload new picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-white">{name || 'Your Name'}</h4>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </button>
              
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preset Student Avatars */}
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-indigo-400" />
            Or choose a stylish avatar:
          </label>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {PRESET_AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(url)}
                className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  avatarPreview === url ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">University</label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  placeholder="e.g. Dhaka University"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Semester Goals</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g. Aiming for 3.9+ GPA this semester! Focused on algorithm assignments."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Saved!
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
