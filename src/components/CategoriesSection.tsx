import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Category } from '@/pages/Index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CategoriesSectionProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

const colors = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

export const CategoriesSection = ({ categories, setCategories }: CategoriesSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: colors[0], keywords: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newCategory.name.trim()) {
      toast.error('Введите название категории');
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      color: newCategory.color,
      keywords: newCategory.keywords.split(',').map(k => k.trim()).filter(k => k),
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', color: colors[0], keywords: '' });
    setIsDialogOpen(false);
    toast.success('Категория добавлена');
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Категория удалена');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setNewCategory({
      name: category.name,
      color: category.color,
      keywords: category.keywords.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!newCategory.name.trim()) {
      toast.error('Введите название категории');
      return;
    }

    setCategories(categories.map(c => 
      c.id === editingId 
        ? {
            ...c,
            name: newCategory.name,
            color: newCategory.color,
            keywords: newCategory.keywords.split(',').map(k => k.trim()).filter(k => k)
          }
        : c
    ));

    setNewCategory({ name: '', color: colors[0], keywords: '' });
    setEditingId(null);
    setIsDialogOpen(false);
    toast.success('Категория обновлена');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Категории расходов</h2>
            <p className="text-gray-600">Управляйте категориями и ключевыми словами для автоматического распознавания</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setNewCategory({ name: '', color: colors[0], keywords: '' });
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить категорию
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    placeholder="Например: Продукты"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Цвет</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          newCategory.color === color ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="keywords">Ключевые слова (через запятую)</Label>
                  <Input
                    id="keywords"
                    placeholder="магнит, пятерочка, ашан"
                    value={newCategory.keywords}
                    onChange={(e) => setNewCategory({ ...newCategory, keywords: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Эти слова будут использоваться для автоматического определения категории
                  </p>
                </div>

                <Button onClick={editingId ? handleUpdate : handleAdd} className="w-full">
                  {editingId ? 'Обновить' : 'Добавить'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="p-4 hover-scale">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon name="Tag" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(category)}
                    className="h-8 w-8"
                  >
                    <Icon name="Pencil" size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(category.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>

              {category.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {category.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Нет ключевых слов</p>
              )}
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex gap-3">
          <Icon name="Lightbulb" className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Как работает автоматическое распознавание?</h4>
            <p className="text-sm text-blue-700 mb-2">
              При загрузке чека система анализирует название магазина и список товаров, 
              сравнивает их с ключевыми словами категорий и автоматически присваивает подходящую категорию.
            </p>
            <p className="text-sm text-blue-700">
              Чем больше ключевых слов вы добавите, тем точнее будет распознавание!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
