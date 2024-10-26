import React, { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import Image from "next/image";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  warningText?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  children?: ReactNode;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  warningText,
  confirmText,
  cancelText,
  onConfirm,
  children
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] bg-white p-0 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 sm:p-6">
          <DialogHeader className="flex flex-col items-center space-y-2">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={100}
              height={50}
              className="mb-2 sm:mb-4 bg-white p-2 sm:p-4"
            />
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-yellow-100 text-xs sm:text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children && (
            <div className="my-2 sm:my-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
              {children}
            </div>
          )}
          {warningText && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 sm:p-4 my-2 sm:my-4 rounded-r-md">
              <p className="text-yellow-700 text-xs sm:text-sm">{warningText}</p>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
            {cancelText && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto border-yellow-500 text-yellow-700 hover:bg-yellow-50 text-sm"
              >
                {cancelText}
              </Button>
            )}
            {confirmText && (
              <Button
                variant="default"
                onClick={onConfirm}
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
              >
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveModal;
