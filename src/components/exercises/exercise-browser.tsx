"use client";

import { useState, useEffect, useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import {
  WgerExerciseInfo,
  WgerPaginatedResponse,
} from "@/types/exercise";
import { WGER_API_BASE_URL } from "@/constants/api";
import { SearchBar } from "./search-bar";
import { ExerciseList } from "./exercise-list";

export function ExerciseBrowser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchUrl = debouncedSearchTerm
    ? `${WGER_API_BASE_URL}/exerciseinfo/?search=${encodeURIComponent(debouncedSearchTerm)}`
    : `${WGER_API_BASE_URL}/exerciseinfo/`;

  const { data: exercisesResponse, isLoading: exercisesLoading } = useApiQuery<
    WgerPaginatedResponse<WgerExerciseInfo>
  >(
    ["exercises", debouncedSearchTerm],
    "GET",
    searchUrl,
    false,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  const filteredExercises = useMemo(() => {
    if (!exercisesResponse?.results) return [];

    const exercises = exercisesResponse.results;

    if (!searchTerm) {
      return exercises.slice(0, 10);
    }

    const lowerSearch = searchTerm.toLowerCase();
    return exercises.filter((exercise) => {
      const exerciseName = exercise.translations?.find((t) => t.language === "en")?.name ||
                          exercise.translations?.[0]?.name ||
                          "";

      if (exerciseName.toLowerCase().includes(lowerSearch)) {
        return true;
      }

      const muscleNames = exercise.muscles
        .map((muscle) => (muscle.name_en || muscle.name).toLowerCase())
        .filter(Boolean);
      if (muscleNames.some((name) => name.includes(lowerSearch))) {
        return true;
      }

      const secondaryMuscleNames = exercise.muscles_secondary
        .map((muscle) => (muscle.name_en || muscle.name).toLowerCase())
        .filter(Boolean);
      if (secondaryMuscleNames.some((name) => name.includes(lowerSearch))) {
        return true;
      }

      const equipmentNames = exercise.equipment
        .map((equipment) => equipment.name.toLowerCase())
        .filter(Boolean);
      if (equipmentNames.some((name) => name.includes(lowerSearch))) {
        return true;
      }

      return false;
    });
  }, [exercisesResponse, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exercise Library</h2>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search exercises, muscles, or equipment..."
        disabled={exercisesLoading && !exercisesResponse}
      />

      <div className="mt-8">
        <ExerciseList
          exercises={filteredExercises}
          isLoading={exercisesLoading && !exercisesResponse}
        />
      </div>
    </div>
  );
}
