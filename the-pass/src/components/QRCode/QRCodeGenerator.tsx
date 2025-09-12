'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ 
  data, 
  title = "QR Code", 
  subtitle,
  size = 200,
  className = "" 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  const generateQRCode = async () => {
    if (!canvasRef.current || !data) return;
    
    setIsGenerating(true);
    try {
      await QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const shareQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      if (navigator.share && navigator.canShare) {
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'qr-code.png', { type: 'image/png' });
            await navigator.share({
              title: title,
              text: subtitle || 'QR Code for The Pass',
              files: [file],
            });
          }
        });
      } else {
        // Fallback to copy to clipboard
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast.success('QR code copied to clipboard!');
          }
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share QR code');
    }
  };

  const copyData = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setIsCopied(true);
      toast.success('QR code data copied!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy data');
    }
  };

  return (
    <Card className={`w-fit ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`border border-border rounded-lg ${
                isGenerating ? 'opacity-50' : ''
              }`}
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQRCode}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareQRCode}
            disabled={isGenerating}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copyData}
            disabled={isGenerating}
          >
            {isCopied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isCopied ? 'Copied!' : 'Copy Data'}
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground break-all">
          {data.length > 50 ? `${data.substring(0, 50)}...` : data}
        </div>
      </CardContent>
    </Card>
  );
}