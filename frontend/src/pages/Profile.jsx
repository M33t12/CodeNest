// pages/Profile.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  Code,
  Brain,
  Edit,
  Save,
  X,
  Trophy,
  Calendar,
  Clock,
  Target,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Twitter,
} from "lucide-react";
import { useUserStore } from "../store/userStore";
import { useDSAStore } from "../store/dsaStore";
import { useAIStore } from "../store/aiStore.js";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showQuizHistory, setShowQuizHistory] = useState(false);
  const { user, updateUserProfile, isLoading } = useUserStore();
  const { userProgress } = useDSAStore();
  const { quizHistory } = useAIStore();

  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profile: {
          linkedin: user.profile?.linkedin || "",
          github: user.profile?.github || "",
          website: user.profile?.website || "",
          bio: user.profile?.bio || "",
        },
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profile: {
          linkedin: user.profile?.linkedin || "",
          github: user.profile?.github || "",
          website: user.profile?.website || "",
          bio: user.profile?.bio || "",
        },
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const formatUrl = (url) => {
    if (!url) return "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  const renderProfileLink = (url, icon) => {
    if (!url) return <div className="py-2 text-gray-500">Not set</div>;

    const formattedUrl = formatUrl(url);
    const isValid = isValidUrl(formattedUrl);

    return (
      <div className="py-2">
        {isValid ? (
          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {icon && <span className="text-blue-500">{icon}</span>}
            <span className="break-all">{url}</span>
            <ExternalLink size={14} className="flex-shrink-0" />
          </a>
        ) : (
          <div className="flex items-center space-x-2 text-gray-900">
            {icon && <span className="text-gray-500">{icon}</span>}
            <span className="break-all">{url}</span>
          </div>
        )}
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const hasProgress = userProgress && userProgress.totalSolved > 0;
  const hasQuizHistory = quizHistory && quizHistory.length > 0;

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account and track your progress
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-gray-800 font-semibold flex items-center space-x-2">
                  <User size={20} />
                  <span>Personal Information</span>
                </h2>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editData.firstName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 text-gray-900 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="py-2 text-gray-900">
                        {user.firstName || "Not set"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={editData.lastName}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="py-2 text-gray-900">
                        {user.lastName || "Not set"}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="py-2 text-gray-900">{user.email}</div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Linkedin
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={editData.profile.linkedin}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          profile: {
                            ...editData.profile,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      placeholder="linkedin.com/in/username or full URL"
                      className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    renderProfileLink(
                      user.profile?.linkedin,
                      <Linkedin size={16} />
                    )
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    GitHub Profile
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="github"
                      value={editData.profile.github}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          profile: {
                            ...editData.profile,
                            github: e.target.value,
                          },
                        })
                      }
                      placeholder="github.com/username or full URL"
                      className="w-full px-3 text-gray-900 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    renderProfileLink(
                      user.profile?.github,
                      <Github size={16} />
                    )
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Personal Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={editData.profile.website}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          profile: {
                            ...editData.profile,
                            website: e.target.value,
                          },
                        })
                      }
                      placeholder="yourwebsite.com or full URL"
                      className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    renderProfileLink(
                      user.profile?.website,
                      <Globe size={16} />
                    )
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      name="bio"
                      value={editData.profile.bio}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          profile: { ...editData.profile, bio: e.target.value },
                        })
                      }
                      placeholder="Tell us about yourself..."
                      className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-900">
                      {user.profile?.bio || "No bio added"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* {hasQuizHistory && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl text-gray-800 font-semibold flex items-center space-x-2">
                    <Brain size={20} />
                    <span>Quiz History</span>
                  </h2>
                  <button
                    onClick={() => setShowQuizHistory(!showQuizHistory)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showQuizHistory ? "Hide History" : "View All"}
                  </button>
                </div>

                <div className="space-y-4">
                  {(showQuizHistory
                    ? quizHistory
                    : quizHistory.slice(0, 3)
                  ).map((quiz, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {quiz.topic || "General Quiz"}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {quiz.description || "No description available"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreBadgeColor(
                            quiz.score
                          )}`}
                        >
                          {quiz.score}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Target size={14} />
                          <span>{quiz.totalQuestions} Questions</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Trophy size={14} />
                          <span className={getScoreColor(quiz.score)}>
                            {quiz.correctAnswers}/{quiz.totalQuestions} Correct
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Clock size={14} />
                          <span>{quiz.timeTaken || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar size={14} />
                          <span>{formatDate(quiz.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!showQuizHistory && quizHistory.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => setShowQuizHistory(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View {quizHistory.length - 3} more quizzes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg text-gray-800 font-semibold mb-4 flex items-center space-x-2">
                <BookOpen size={18} />
                <span>Resources</span>
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {user.resourcesUploaded?.length || 0}
                </div>
                <div className="text-gray-600">Uploaded</div>
              </div>
            </div>

            {hasProgress ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg text-gray-800 font-semibold mb-4 flex items-center space-x-2">
                  <Code size={18} />
                  <span>DSA Progress</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Solved</span>
                    <span className="font-semibold text-blue-600">
                      {userProgress.totalSolved}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (userProgress.totalSolved / 100) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        {userProgress.easySolved}
                      </div>
                      <div className="text-xs text-green-600">Easy</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-yellow-600">
                        {userProgress.mediumSolved}
                      </div>
                      <div className="text-xs text-yellow-600">Medium</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-red-600">
                        {userProgress.hardSolved}
                      </div>
                      <div className="text-xs text-red-600">Hard</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg text-gray-800 font-semibold mb-4 flex items-center space-x-2">
                  <Code size={18} />
                  <span>DSA Progress</span>
                </h3>
                <div className="text-center py-8">
                  <Code size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No problems solved yet</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Start Solving
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg text-gray-800 font-semibold mb-4 flex items-center space-x-2">
                <Brain size={18} />
                <span>AI Quizzes</span>
              </h3>
              {hasQuizHistory ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {quizHistory.length}
                    </div>
                    <div className="text-gray-600">Completed</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Score</span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          Math.round(
                            quizHistory.reduce(
                              (sum, quiz) => sum + quiz.score,
                              0
                            ) / quizHistory.length
                          )
                        )}`}
                      >
                        {Math.round(
                          quizHistory.reduce(
                            (sum, quiz) => sum + quiz.score,
                            0
                          ) / quizHistory.length
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-3">No quizzes taken yet</p>
                  <button className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Take Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
