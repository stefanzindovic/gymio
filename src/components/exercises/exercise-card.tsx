"use client";

import { WgerExerciseInfo } from "@/types/exercise";

interface ExerciseCardProps {
  exercise: WgerExerciseInfo;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const mainImage = exercise.images?.find((img) => img.is_main);
  const imageUrl = mainImage?.image;

  const exerciseName = exercise.translations?.find((t) => t.language === "en")?.name ||
                       exercise.translations?.[0]?.name ||
                       "Unnamed Exercise";

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="w-full h-48 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={exerciseName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">No Image Available</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {exerciseName}
        </h3>

        {exercise.category && (
          <p className="text-sm text-gray-500 mb-4">
            Category: <span className="font-medium">{exercise.category.name}</span>
          </p>
        )}

        <div className="space-y-3">
          {exercise.muscles.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Primary Muscles
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {exercise.muscles.map((muscle) => (
                  <span
                    key={muscle.id}
                    className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                  >
                    {muscle.name_en || muscle.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.muscles_secondary.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Secondary Muscles
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {exercise.muscles_secondary.map((muscle) => (
                  <span
                    key={muscle.id}
                    className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700"
                  >
                    {muscle.name_en || muscle.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.equipment.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Equipment
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {exercise.equipment.map((equipment) => (
                  <span
                    key={equipment.id}
                    className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                  >
                    {equipment.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.equipment.length === 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Equipment
              </span>
              <div className="mt-2">
                <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  Bodyweight
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
