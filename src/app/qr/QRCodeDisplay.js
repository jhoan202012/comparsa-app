'use client';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay({ value }) {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '2px solid #E5E7EB' }}>
      <QRCodeSVG value={value} size={280} level="H" includeMargin={true} />
    </div>
  );
}
