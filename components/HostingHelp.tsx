import React from 'react';
import { Icons } from './Icons';

interface HostingHelpProps {
  onClose: () => void;
}

export const HostingHelp: React.FC<HostingHelpProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Icons.Info size={20} className="text-indigo-400" />
            How to Host?
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
          <p>
            The downloaded HTML file is self-contained but works best when hosted on a web server due to browser security restrictions.
          </p>

          <div className="space-y-3">
            <h4 className="font-medium text-white text-base">Option 1: Tiiny.host (Easiest)</h4>
            <ol className="list-decimal pl-5 space-y-1 text-sm marker:text-slate-500">
              <li>Go to <a href="https://tiiny.host" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">tiiny.host</a></li>
              <li>Drag & Drop your downloaded <code>.html</code> file.</li>
              <li>Type a link name and click Upload.</li>
              <li>Copy the resulting URL and use it in your iframe.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white text-base">Option 2: Netlify Drop (Permanent)</h4>
            <ol className="list-decimal pl-5 space-y-1 text-sm marker:text-slate-500">
              <li>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">app.netlify.com/drop</a></li>
              <li>Drag & Drop the <code>.html</code> file (or a folder containing it).</li>
              <li>Wait for upload to finish.</li>
              <li>Click the generated link to view your slider.</li>
            </ol>
          </div>
          
           <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm">
            <p className="text-indigo-300 font-medium mb-1">Squarespace Embed Code:</p>
            <code className="block bg-black/30 p-2 rounded text-indigo-200 font-mono text-xs select-all">
              &lt;iframe src="YOUR_LINK_HERE" width="100%" style="aspect-ratio: 16/9; border:0;"&gt;&lt;/iframe&gt;
            </code>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
