import React, { useState } from "react";
import { ExternalLink, CheckCircle2, Circle, Clock,ChevronDown } from "lucide-react";
import useProblemStore from "../../store/problemStore";
import useProgressStore from "../../store/progressStore";
import { useUserStore } from "../../store/userStore";
import ProblemNoteModal from "./ProblemNoteModal";

const ProblemList = () => {
  const { problems, loading } = useProblemStore();
  const { progressMap, updateProgress } = useProgressStore();
  const getUserId = useUserStore((state) => state.getUserId);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const userId = getUserId();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // console.log("Problems :", problems);

  const getStatusIcon = (problemId) => {
    const progress = progressMap[problemId];
    if (!progress) return <Circle className="w-5 h-5 text-gray-400" />;

    switch (progress.status) {
      case "solved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "attempted":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleStatusChange = async (problemId, newStatus) => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    try {
      await updateProgress(userId, problemId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openNoteModal = (problem) => {
    setSelectedProblem(problem);
    setNoteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No problems found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acceptance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr
                key={problem._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === problem._id ? null : problem._id
                        )
                      }
                      disabled={!userId}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {getStatusIcon(problem._id)}
                      <span className="whitespace-nowrap">
                        {progressMap[problem._id]?.status === "solved"
                          ? "Solved"
                          : progressMap[problem._id]?.status === "attempted"
                          ? "Attempted"
                          : "Not Started"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openDropdownId === problem._id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openDropdownId === problem._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <div className="p-2">
                            <button
                              onClick={() => {
                                handleStatusChange(problem._id, "not-started");
                                setOpenDropdownId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                (progressMap[problem._id]?.status ||
                                  "not-started") === "not-started"
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Circle className="w-4 h-4" />
                              Not Started
                            </button>
                            <button
                              onClick={() => {
                                handleStatusChange(problem._id, "attempted");
                                setOpenDropdownId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                progressMap[problem._id]?.status === "attempted"
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              Attempted
                            </button>
                            <button
                              onClick={() => {
                                handleStatusChange(problem._id, "solved");
                                setOpenDropdownId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                progressMap[problem._id]?.status === "solved"
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Solved
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {problem.leetcodeId}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(problem._id)}
                    <span className="text-sm font-medium text-gray-900">
                      {problem.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {problem.topics
                      .flat()
                      .slice(0, 3)
                      .map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    {problem.topics.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{problem.topics.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {problem.acRate ? `${problem.acRate.toFixed(1)}%` : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <a
                      href={problem.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (userId && !progressMap[problem._id]?.status) {
                          handleStatusChange(problem._id, "attempted");
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Solve
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => openNoteModal(problem)}
                      disabled={!userId}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Notes
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {noteModalOpen && selectedProblem && (
        <ProblemNoteModal
          problem={selectedProblem}
          onClose={() => setNoteModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProblemList;
