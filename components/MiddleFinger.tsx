import React from "react";

interface MiddleFingerProps {
  size?: number;
  className?: string;
}

export function MiddleFinger({ size = 16, className = "" }: MiddleFingerProps) {
  // Calculate font size based on the size prop (slightly larger for better appearance)
  const fontSize = Math.max(size * 1.2, 18);
  
  return (
    <div 
      className={`flex items-center justify-center super-dislike-icon ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        marginTop: '1px',
        // marginBottom: '4px',
        padding: '0'
      }}
    >
      🖕
    </div>
  );
} 