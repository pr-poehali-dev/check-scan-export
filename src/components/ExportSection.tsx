import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import type { Receipt, Category } from '@/pages/Index';
import { toast } from 'sonner';
import { useState } from 'react';

interface ExportSectionProps {
  receipts: Receipt[];
  categories: Category[];
}

export const ExportSection = ({ receipts, categories }: ExportSectionProps) => {
  const [exportFormat, setExportFormat] = useState<'detailed' | 'summary' | 'categories'>('detailed');

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportDetailed = () => {
    const data = receipts.map(r => ({
      'Дата': r.date,
      'Магазин': r.store,
      'Категория': r.category,
      'Сумма': r.amount,
      'Товары': r.items.join('; ')
    }));
    
    generateCSV(data, ['Дата', 'Магазин', 'Категория', 'Сумма', 'Товары']);
    toast.success('Детальный отчёт экспортирован');
  };

  const exportSummary = () => {
    const summary = receipts.reduce((acc, r) => {
      const date = r.date;
      if (!acc[date]) {
        acc[date] = { date, count: 0, total: 0 };
      }
      acc[date].count++;
      acc[date].total += r.amount;
      return acc;
    }, {} as Record<string, { date: string; count: number; total: number }>);

    const data = Object.values(summary).map(s => ({
      'Дата': s.date,
      'Количество чеков': s.count,
      'Общая сумма': s.total
    }));

    generateCSV(data, ['Дата', 'Количество чеков', 'Общая сумма']);
    toast.success('Сводка по дням экспортирована');
  };

  const exportByCategories = () => {
    const categoryTotals = categories.map(cat => {
      const categoryReceipts = receipts.filter(r => r.category === cat.name);
      return {
        'Категория': cat.name,
        'Количество чеков': categoryReceipts.length,
        'Общая сумма': categoryReceipts.reduce((sum, r) => sum + r.amount, 0),
        'Средний чек': categoryReceipts.length > 0 
          ? Math.round(categoryReceipts.reduce((sum, r) => sum + r.amount, 0) / categoryReceipts.length)
          : 0
      };
    }).filter(c => c['Количество чеков'] > 0);

    generateCSV(categoryTotals, ['Категория', 'Количество чеков', 'Общая сумма', 'Средний чек']);
    toast.success('Отчёт по категориям экспортирован');
  };

  const handleExport = () => {
    if (receipts.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    switch (exportFormat) {
      case 'detailed':
        exportDetailed();
        break;
      case 'summary':
        exportSummary();
        break;
      case 'categories':
        exportByCategories();
        break;
    }
  };

  const formats = [
    {
      id: 'detailed',
      title: 'Детальный отчёт',
      description: 'Все чеки с полной информацией: дата, магазин, категория, сумма, список товаров',
      icon: 'FileSpreadsheet',
    },
    {
      id: 'summary',
      title: 'Сводка по дням',
      description: 'Сгруппированные данные по датам: количество чеков и общая сумма за каждый день',
      icon: 'Calendar',
    },
    {
      id: 'categories',
      title: 'Отчёт по категориям',
      description: 'Статистика по каждой категории: количество, общая сумма, средний чек',
      icon: 'PieChart',
    },
  ];

  const stats = {
    total: receipts.length,
    amount: receipts.reduce((sum, r) => sum + r.amount, 0),
    categories: new Set(receipts.map(r => r.category)).size,
    period: receipts.length > 0 ? {
      start: new Date(Math.min(...receipts.map(r => new Date(r.date).getTime()))).toLocaleDateString('ru-RU'),
      end: new Date(Math.max(...receipts.map(r => new Date(r.date).getTime()))).toLocaleDateString('ru-RU')
    } : null
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Экспорт данных</h2>
          <p className="text-gray-600">Выгрузите данные о расходах в формате Excel (CSV)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Icon name="Receipt" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-700">Чеков</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Icon name="Wallet" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-green-700">Сумма</p>
                <p className="text-2xl font-bold text-green-900">{stats.amount.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Icon name="Tags" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-purple-700">Категорий</p>
                <p className="text-2xl font-bold text-purple-900">{stats.categories}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Icon name="CalendarRange" className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-orange-700">Период</p>
                <p className="text-sm font-bold text-orange-900">
                  {stats.period ? `${stats.period.start} - ${stats.period.end}` : '-'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <Label className="text-base font-semibold mb-4 block">Выберите формат экспорта</Label>
          <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
            <div className="space-y-3">
              {formats.map((format) => (
                <Card 
                  key={format.id}
                  className={`p-4 cursor-pointer transition-all hover-scale ${
                    exportFormat === format.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setExportFormat(format.id as any)}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value={format.id} id={format.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name={format.icon as any} size={20} className="text-primary" />
                        <Label htmlFor={format.id} className="text-base font-semibold cursor-pointer">
                          {format.title}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={handleExport} 
          size="lg" 
          className="w-full"
          disabled={receipts.length === 0}
        >
          <Icon name="Download" size={20} className="mr-2" />
          Экспортировать в Excel
        </Button>

        {receipts.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Загрузите чеки, чтобы начать экспорт данных
          </p>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex gap-3">
          <Icon name="Info" className="text-green-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-green-900 mb-2">О формате Excel (CSV)</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Файл можно открыть в Microsoft Excel, Google Sheets или любом редакторе таблиц</li>
              <li>• Данные сохраняются в кодировке UTF-8 с поддержкой русского языка</li>
              <li>• После экспорта вы можете создавать собственные графики и сводные таблицы</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
