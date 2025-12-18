"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/exercises/search-bar";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { useApiQuery } from "@/hooks/use-api-query";
import { WgerPaginatedResponse, WgerExerciseInfo } from "@/types/exercise";
import { BaseModalProps } from "@/types/modal";

interface ExerciseSearchModalProps extends BaseModalProps {
  onSelectExercise: (exercise: WgerExerciseInfo) => void;
}

const WGER_API_BASE_URL = "https://wger.de/api/v2";

export function ExerciseSearchModal({
  isOpen,
  onClose,
  onSelectExercise,
}: ExerciseSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useMemo(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchUrl = debouncedSearchTerm
    ? `${WGER_API_BASE_URL}/exerciseinfo/?search=${encodeURIComponent(searchTerm)}`
    : `${WGER_API_BASE_URL}/exerciseinfo/`;

  const { data: exercisesResponse, isLoading: exercisesLoading } = useApiQuery<
    WgerPaginatedResponse<WgerExerciseInfo>
  >(
    ["exercises", searchTerm],
    "GET",
    searchUrl,
    false,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  const exercises = exercisesResponse?.results || [];

  const handleSelectExercise = (exercise: WgerExerciseInfo) => {
    onSelectExercise(exercise);
    setSearchTerm("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Exercise"
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search exercises..."
          disabled={exercisesLoading}
        />

        {exercisesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg bg-gray-100 animate-pulse h-64"
              />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {searchTerm ? "No exercises found" : "Start typing to search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="relative cursor-pointer"
                onClick={() => handleSelectExercise(exercise)}
              >
                <ExerciseCard exercise={exercise} />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-lg transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
