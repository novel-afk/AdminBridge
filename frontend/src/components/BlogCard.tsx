import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface BlogCardProps {
  id: number;
  title: string;
  author: string;
  authorTitle: string;
  date: string;
  isPublished: boolean;
  tags: string[];
  onClick?: () => void;
  onSelect?: (id: number, checked: boolean) => void;
  selectable?: boolean;
  selected?: boolean;
}

const BlogCard = ({ 
  id,
  title, 
  author, 
  authorTitle,
  date, 
  isPublished, 
  tags, 
  onClick,
  onSelect,
  selectable = false,
  selected = false
}: BlogCardProps) => {
  
  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(id, checked);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white" onClick={onClick}>
      <div className="flex items-start justify-between">
        {selectable && (
          <div className="pt-1 pr-3" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              checked={selected}
              onCheckedChange={handleCheckboxChange}
            />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          
          <div className="mt-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{author}</p>
              <p className="text-xs text-gray-500">{authorTitle}</p>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            {date}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {isPublished && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                Published
              </Badge>
            )}
            
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard; 