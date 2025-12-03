import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Receipt, Category } from '@/pages/Index';

interface UploadSectionProps {
  onReceiptAdd: (receipt: Receipt) => void;
  categories: Category[];
}

export const UploadSection = ({ onReceiptAdd, categories }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectCategory = (storeName: string, items: string[]): string => {
    const searchText = `${storeName} ${items.join(' ')}`.toLowerCase();
    
    for (const category of categories) {
      if (category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return category.name;
      }
    }
    
    return 'Другое';
  };

  const processReceipt = async (file: File) => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockStores = ['Пятёрочка', 'Магнит', 'Перекрёсток', 'Аптека 36.6', 'Яндекс Такси'];
    const mockItems = [
      ['Молоко 3.2%', 'Хлеб белый', 'Масло сливочное'],
      ['Парацетамол', 'Витамины'],
      ['Поездка по городу'],
      ['Футболка', 'Джинсы'],
      ['Кофе латте', 'Чизкейк']
    ];

    const randomStore = mockStores[Math.floor(Math.random() * mockStores.length)];
    const randomItems = mockItems[Math.floor(Math.random() * mockItems.length)];
    const randomAmount = Math.floor(Math.random() * 3000) + 200;

    const receipt: Receipt = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      store: randomStore,
      amount: randomAmount,
      category: detectCategory(randomStore, randomItems),
      items: randomItems,
    };

    onReceiptAdd(receipt);
    setIsProcessing(false);
    
    toast.success(`Чек распознан!`, {
      description: `${receipt.store} - ${receipt.amount}₽ (${receipt.category})`
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      processReceipt(imageFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processReceipt(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Загрузить чек</h2>
          <p className="text-gray-600">Загрузите фото чека для автоматического распознавания</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-gray-300 hover:border-primary/50'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Icon name="ScanLine" className="text-primary" size={32} />
              </div>
              <p className="text-lg font-medium text-gray-900">Распознаю чек...</p>
              <p className="text-sm text-gray-600">Определяю категорию расходов</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Upload" className="text-primary" size={32} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  Перетащите фото чека сюда
                </p>
                <p className="text-sm text-gray-600">или нажмите кнопку ниже</p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="mt-4"
              >
                <Icon name="Image" size={20} className="mr-2" />
                Выбрать файл
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <Icon name="Sparkles" className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">Автоматическое распознавание</p>
              <p className="text-blue-700">
                Система автоматически определит магазин, сумму, товары и категорию расхода на основе содержимого чека
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
