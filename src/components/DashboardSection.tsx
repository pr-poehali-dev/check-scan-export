import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Receipt, Category } from '@/pages/Index';

interface DashboardSectionProps {
  receipts: Receipt[];
  categories: Category[];
}

export const DashboardSection = ({ receipts, categories }: DashboardSectionProps) => {
  const totalAmount = receipts.reduce((sum, r) => sum + r.amount, 0);
  
  const categoryData = categories.map(cat => {
    const amount = receipts
      .filter(r => r.category === cat.name)
      .reduce((sum, r) => sum + r.amount, 0);
    return {
      name: cat.name,
      value: amount,
      color: cat.color,
    };
  }).filter(d => d.value > 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    amount: receipts
      .filter(r => r.date === date)
      .reduce((sum, r) => sum + r.amount, 0),
  }));

  const stats = [
    {
      icon: 'Receipt',
      label: 'Всего чеков',
      value: receipts.length,
      color: 'bg-blue-500',
    },
    {
      icon: 'TrendingUp',
      label: 'Общая сумма',
      value: `${totalAmount.toLocaleString('ru-RU')} ₽`,
      color: 'bg-green-500',
    },
    {
      icon: 'Calendar',
      label: 'За 7 дней',
      value: receipts.filter(r => {
        const receiptDate = new Date(r.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return receiptDate >= weekAgo;
      }).length,
      color: 'bg-purple-500',
    },
    {
      icon: 'ShoppingBag',
      label: 'Средний чек',
      value: receipts.length > 0 ? `${Math.round(totalAmount / receipts.length).toLocaleString('ru-RU')} ₽` : '0 ₽',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6 hover-scale">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <Icon name={stat.icon as any} className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {receipts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Icon name="FileX" size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Нет данных для отображения</p>
            <p className="text-sm">Загрузите первый чек, чтобы увидеть аналитику</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="PieChart" size={20} />
                Расходы по категориям
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={20} />
                Расходы за 7 дней
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`} />
                  <Bar dataKey="amount" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="ListOrdered" size={20} />
              Топ категории
            </h3>
            <div className="space-y-4">
              {categoryData
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: cat.color }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{cat.name}</span>
                        <span className="font-bold text-gray-900">{cat.value.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(cat.value / totalAmount) * 100}%`,
                            backgroundColor: cat.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
