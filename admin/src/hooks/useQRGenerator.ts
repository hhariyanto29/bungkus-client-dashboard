import { useState } from 'react';
import { qrAPI, clientsAPI } from '../services/api';

interface QRFormData {
  client_id: number;
  table_number: string;
  valid_until: string;
}

interface GeneratedQR {
  id: number;
  client_id: number;
  table_number: string;
  qr_image: string;
  status: string;
  created_at: string;
  client_name?: string;
}

export const useQRGenerator = () => {
  const [formData, setFormData] = useState<QRFormData>({
    client_id: 0,
    table_number: '',
    valid_until: '',
  });
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      return response.data.data || [];
    } catch (err) {
      console.error('Error fetching clients:', err);
      return [];
    }
  };

  // Fetch existing QR codes
  const fetchQRCodes = async () => {
    try {
      const response = await qrAPI.getAll();
      const qrCodes = response.data.data || [];
      setGeneratedQRs(qrCodes);
    } catch (err) {
      console.error('Error fetching QR codes:', err);
    }
  };

  // Generate QR code
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      if (!formData.client_id || !formData.table_number) {
        throw new Error('Client and table number are required');
      }

      const response = await qrAPI.generate({
        client_id: formData.client_id,
        table_number: formData.table_number,
        valid_until: formData.valid_until || undefined,
      });

      if (response.data.success) {
        const newQR = response.data.data;
        setGeneratedQRs([newQR, ...generatedQRs]);
        setShowSuccess(true);
        setFormData({
          client_id: 0,
          table_number: '',
          valid_until: '',
        });

        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Bulk generate QR codes
  const handleBulkGenerate = async (clientId: number, tableNumbers: string[], validUntil?: string) => {
    try {
      const response = await qrAPI.bulkGenerate(clientId, tableNumbers, validUntil);
      
      if (response.data.success) {
        const newQRs = response.data.data;
        setGeneratedQRs([...newQRs, ...generatedQRs]);
        return { success: true, count: newQRs.length };
      }
    } catch (err: any) {
      console.error('Bulk generate error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to generate QR codes' };
    }
  };

  // Update QR code status
  const updateQRStatus = async (id: number, status: string) => {
    try {
      const response = await qrAPI.updateStatus(id, status);
      
      if (response.data.success) {
        setGeneratedQRs(prev =>
          prev.map(qr =>
            qr.id === id ? { ...qr, status } : qr
          )
        );
        return true;
      }
    } catch (err) {
      console.error('Error updating QR status:', err);
      return false;
    }
  };

  // Delete QR code
  const deleteQR = async (id: number) => {
    try {
      const response = await qrAPI.delete(id);
      
      if (response.data.success) {
        setGeneratedQRs(prev => prev.filter(qr => qr.id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting QR code:', err);
      return false;
    }
  };

  // Download QR code
  const downloadQR = (qrImage: string, filename: string) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    formData,
    setFormData,
    generatedQRs,
    isGenerating,
    showSuccess,
    error,
    fetchClients,
    fetchQRCodes,
    handleGenerate,
    handleBulkGenerate,
    updateQRStatus,
    deleteQR,
    downloadQR,
  };
};