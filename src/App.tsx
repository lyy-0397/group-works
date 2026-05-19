/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Image as ImageIcon, 
  User, 
  Type, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Submission {
  id: string;
  name: string;
  author: string;
  description: string;
  type: string;
  imageUrl?: string;
  timestamp: number;
}

const WORK_TYPES = ["美术", "音乐", "交互", "其它"];

export default function App() {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    description: '',
    type: WORK_TYPES[0],
    customType: '',
    image: null as File | null,
  });
  
  // UI State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived current type for display
  const displayType = formData.type === '其它' ? (formData.customType || '其它') : formData.type;

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create local preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.author) {
      setMessage({ type: 'error', text: '请填写作品名称和作者姓名' });
      return;
    }

    if (formData.type === '其它' && !formData.customType) {
      setMessage({ type: 'error', text: '请填写自定义作品类型' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Simulate API call to JSONPlaceholder
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.name,
          body: formData.description,
          userId: 1,
          author: formData.author,
          type: displayType,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);

        // Add to local list
        const newSubmission: Submission = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          author: formData.author,
          description: formData.description,
          type: displayType,
          imageUrl: previewUrl || undefined,
          timestamp: Date.now(),
        };

        setSubmissions(prev => [newSubmission, ...prev]);
        setMessage({ type: 'success', text: '作品提交成功！' });
        
        // Reset Form
        setFormData({
          name: '',
          author: '',
          description: '',
          type: WORK_TYPES[0],
          customType: '',
          image: null,
        });
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error('提交失败');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '提交过程中出错，请稍后重试。' });
    } finally {
      setIsSubmitting(false);
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const deleteSubmission = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">团队作品提交系统</h1>
            <p className="text-slate-500 mt-1">记录创意，展示团队协作成果。</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            在线演示模式
          </div>
        </header>

        {/* Main Content: Form & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Submission Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">发布新作品</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                {/* Work Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <Type className="w-4 h-4" /> 作品名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="输入作品标题..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label htmlFor="author" className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4" /> 作者姓名
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="请输入姓名"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label htmlFor="type" className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4" /> 作品类型
                  </label>
                  <div className="space-y-2">
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      {WORK_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <AnimatePresence>
                      {formData.type === '其它' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <input
                            type="text"
                            name="customType"
                            value={formData.customType}
                            onChange={handleInputChange}
                            placeholder="请填写自定义类型..."
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-sm"
                            required={formData.type === '其它'}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4" /> 作品简介
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="简短描述您的作品亮点..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <ImageIcon className="w-4 h-4" /> 作品封面 / 截图
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer relative border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all hover:border-blue-400 hover:bg-blue-50/10 flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {previewUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-medium bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">点击更换图片</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors">
                          <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">点击上传图片查看预览</p>
                        <p className="text-xs text-slate-400">支持 JPG, PNG (最大 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button & Message */}
              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? '正在提交数据...' : '提交数据'}
                </button>
                
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                        message.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>

          {/* Real-time Preview Area */}
          <div className="space-y-4 lg:sticky lg:top-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">实时预览效果</h3>
            
            <motion.div 
              layout
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="aspect-video bg-slate-100 relative group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                    <ImageIcon className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-sm">暂无作品预览图</p>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm border border-white/20">
                    {displayType}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 break-words leading-tight">
                    {formData.name || "作品名称"}
                  </h2>
                  <div className="flex items-center gap-2 mt-3 text-blue-600 font-medium">
                    <User className="w-4 h-4" />
                    <span>{formData.author || "作者姓名"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-px bg-slate-100 w-full"></div>
                  <p className="text-slate-600 leading-relaxed min-h-[4rem]">
                    {formData.description || "这里将显示您的作品简介..."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                      +
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                    查看详情 <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
            
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                💡 <b>专业提示:</b> 确保您的作品名称简洁有力。上传高质量的图片能获得最佳视觉展示效果。
              </p>
            </div>
          </div>

        </div>

        {/* Submissions List */}
        <section className="space-y-6 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                {submissions.length}
              </div>
              <h2 className="text-xl font-bold text-slate-900">已提交作品列表</h2>
            </div>
            {submissions.length > 0 && (
              <button 
                onClick={() => setSubmissions([])}
                className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
              >
                全部清除
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {submissions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl font-medium"
                >
                  <ImageIcon className="w-12 h-12 mb-3 stroke-[1]" />
                  <p>尚无已提交的作品</p>
                  <p className="text-xs mt-1">填写表单并点击“提交数据”开始</p>
                </motion.div>
              ) : (
                submissions.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:border-blue-200"
                  >
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-semibold text-white">
                          {item.type}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteSubmission(item.id)}
                        className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <User className="w-3 h-3" /> {item.author}
                      </p>
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2 min-h-[2.5rem]">
                        {item.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span>ID: {item.id}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-8 text-center border-t border-slate-200">
          <p className="text-sm text-slate-400">
            © 2026 团队协作系统演示版 · 纯前端实现 · 功能演示工具
          </p>
        </footer>
      </div>
    </div>
  );
}

