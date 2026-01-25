import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";

type FilterControlsProps = {
  onFilterChange: (filters: { difficulty: string; dataWeight: string; language: string; }) => void;
};

export function FilterControls({ onFilterChange }: FilterControlsProps) {
  const handleDifficultyChange = (value: string) => {
    onFilterChange((prev) => ({ ...prev, difficulty: value }));
  };

  const handleDataWeightChange = (value: string) => {
    onFilterChange((prev) => ({ ...prev, dataWeight: value }));
  };

  const handleLanguageChange = (value: string) => {
    onFilterChange((prev) => ({ ...prev, language: value }));
  };

  return (
    <div className="p-0 bg-card">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="difficulty-select" className="sr-only">Niveau</Label>
          <Select onValueChange={handleDifficultyChange} defaultValue="all">
            <SelectTrigger id="difficulty-select" className="h-8 text-xs">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="Débutant">Débutant</SelectItem>
              <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
              <SelectItem value="Avancé">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data-weight-select" className="sr-only">Poids Data</Label>
          <Select onValueChange={handleDataWeightChange} defaultValue="all">
            <SelectTrigger id="data-weight-select" className="h-8 text-xs">
              <SelectValue placeholder="Poids" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les poids</SelectItem>
              <SelectItem value="Plume">Plume</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Flux">Flux</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language-select" className="sr-only">Langue</Label>
          <Select onValueChange={handleLanguageChange} defaultValue="all">
            <SelectTrigger id="language-select" className="h-8 text-xs">
              <SelectValue placeholder="Langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les langues</SelectItem>
              <SelectItem value="Français">Français</SelectItem>
              <SelectItem value="Anglais">Anglais</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
