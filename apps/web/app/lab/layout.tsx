import React from 'react';
import LabLayoutShell from '../../components/lab/LabLayoutShell';

export default function LabPortalLayout({ children }: { children: React.ReactNode }) {
  return <LabLayoutShell>{children}</LabLayoutShell>;
}
