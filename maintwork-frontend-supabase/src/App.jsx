import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [uploading, setUploading] = useState(false);
  const [filesUploaded, setFilesUploaded] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    let uploadedList = [];
    for (let file of acceptedFiles) {
      const filePath = `workorders/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('workorder-files')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error.message);
      } else {
        uploadedList.push(filePath);
      }
    }
    setFilesUploaded(uploadedList);
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const getPublicUrl = (path) => {
    const { data } = supabase.storage.from('workorder-files').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Work Order Tracker</h1>
      <div
        {...getRootProps({ className: 'border-dashed border-2 p-6 text-center bg-white cursor-pointer' })}
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>
      {uploading && <p className="mt-2 text-blue-500">Uploading...</p>}
      <ul className="mt-4">
        {filesUploaded.map((path) => (
          <li key={path}>
            <a
              href={getPublicUrl(path)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {path}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}