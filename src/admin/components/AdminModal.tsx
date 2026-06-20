// Thin re-export so legacy imports (`AdminModal`) keep working while the
// underlying implementation lives in our shared UI primitives.
import { Modal } from '../../components/ui/Modal';
import type { ReactNode } from 'react';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string; // legacy: px width string like '720px'
}

const widthToTailwind = (w?: string): string => {
  if (!w) return 'max-w-2xl';
  const px = parseInt(w, 10);
  if (Number.isNaN(px)) return 'max-w-2xl';
  if (px <= 480) return 'max-w-md';
  if (px <= 560) return 'max-w-lg';
  if (px <= 640) return 'max-w-xl';
  if (px <= 720) return 'max-w-3xl';
  if (px <= 820) return 'max-w-4xl';
  return 'max-w-5xl';
};

const AdminModal = ({ open, onClose, title, children, width }: AdminModalProps) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth={widthToTailwind(width)}>
    {children}
  </Modal>
);

export default AdminModal;
