
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloudIcon, FileIcon, XIcon } from './icons';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, files }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter(file => file !== fileToRemove);
    onFilesSelected(newFiles);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-brand-primary bg-brand-light' : 'border-gray-300 hover:border-brand-primary hover:bg-brand-light'}`}
      >
        <input {...getInputProps()} />
        <UploadCloudIcon className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-lg font-semibold text-gray-700">
          {isDragActive ? 'Suelta los archivos aquí...' : 'Arrastra y suelta tus reportes PDF aquí, o haz clic para seleccionar'}
        </p>
        <p className="text-sm text-gray-500 mt-1">Solo se aceptan archivos .pdf</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800">Archivos Seleccionados:</h3>
          <ul className="mt-2 space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                <div className="flex items-center">
                  <FileIcon className="w-6 h-6 text-brand-primary" />
                  <span className="ml-3 font-medium text-gray-700">{file.name}</span>
                  <span className="ml-3 text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-danger"
                  aria-label={`Remover ${file.name}`}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
