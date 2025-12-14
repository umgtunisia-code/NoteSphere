import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorSelector = ({ value, onChange }: ColorSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          style={{ color: value, borderColor: value }}
        >
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2 border" 
              style={{ backgroundColor: value }} 
            />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <HexColorPicker color={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};