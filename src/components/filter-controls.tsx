import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

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
    <div className="p-2 sm:p-3 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Filter className="w-4 h-4" />
        <h3 className="text-sm sm:text-base font-semibold">Filtres</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div>
          <Label htmlFor="difficulty-select" className="text-xs sm:text-sm">Niveau</Label>
          <Select onValueChange={handleDifficultyChange} defaultValue="all">
            <SelectTrigger id="difficulty-select" className="h-9">
              <SelectValue placeholder="Tous les niveaux" />
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
          <Label htmlFor="data-weight-select" className="text-xs sm:text-sm">Poids Data</Label>
          <Select onValueChange={handleDataWeightChange} defaultValue="all">
            <SelectTrigger id="data-weight-select" className="h-9">
              <SelectValue placeholder="Tous les poids" />
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
          <Label htmlFor="language-select" className="text-xs sm:text-sm">Langue</Label>
          <Select onValueChange={handleLanguageChange} defaultValue="all">
            <SelectTrigger id="language-select" className="h-9">
              <SelectValue placeholder="Toutes les langues" />
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
