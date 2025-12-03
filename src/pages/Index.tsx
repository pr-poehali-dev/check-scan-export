import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { UploadSection } from '@/components/UploadSection';
import { DashboardSection } from '@/components/DashboardSection';
import { HistorySection } from '@/components/HistorySection';
import { CategoriesSection } from '@/components/CategoriesSection';
import { ExportSection } from '@/components/ExportSection';

export interface Receipt {
  id: string;
  date: string;
  store: string;
  amount: number;
  category: string;
  items: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  keywords: string[];
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Продукты', color: '#10B981', keywords: ['магнит', 'пятерочка', 'ашан', 'перекресток', 'молоко', 'хлеб'] },
  { id: '2', name: 'Транспорт', color: '#3B82F6', keywords: ['такси', 'яндекс', 'uber', 'метро', 'бензин'] },
  { id: '3', name: 'Развлечения', color: '#F59E0B', keywords: ['кино', 'театр', 'ресторан', 'кафе', 'бар'] },
  { id: '4', name: 'Здоровье', color: '#EF4444', keywords: ['аптека', 'лекарства', 'медицина', 'клиника'] },
  { id: '5', name: 'Одежда', color: '#8B5CF6', keywords: ['zara', 'h&m', 'обувь', 'одежда'] },
  { id: '6', name: 'Другое', color: '#6B7280', keywords: [] },
];

const Index = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activeTab, setActiveTab] = useState('dashboard');

  const addReceipt = (receipt: Receipt) => {
    setReceipts(prev => [receipt, ...prev]);
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Receipt" className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Учёт Расходов</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Чеков обработано: <span className="font-semibold text-gray-900">{receipts.length}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white p-1 h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
              <Icon name="LayoutDashboard" size={18} />
              <span className="hidden sm:inline">Дашборд</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2 py-3">
              <Icon name="Upload" size={18} />
              <span className="hidden sm:inline">Загрузка</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 py-3">
              <Icon name="History" size={18} />
              <span className="hidden sm:inline">История</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2 py-3">
              <Icon name="Tags" size={18} />
              <span className="hidden sm:inline">Категории</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 py-3">
              <Icon name="Download" size={18} />
              <span className="hidden sm:inline">Экспорт</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in">
            <DashboardSection receipts={receipts} categories={categories} />
          </TabsContent>

          <TabsContent value="upload" className="animate-fade-in">
            <UploadSection onReceiptAdd={addReceipt} categories={categories} />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <HistorySection receipts={receipts} categories={categories} onDelete={deleteReceipt} />
          </TabsContent>

          <TabsContent value="categories" className="animate-fade-in">
            <CategoriesSection categories={categories} setCategories={setCategories} />
          </TabsContent>

          <TabsContent value="export" className="animate-fade-in">
            <ExportSection receipts={receipts} categories={categories} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
