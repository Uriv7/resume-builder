"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";
import jsPDF from "jspdf";
import Link from "next/link";

export default function GenerateResume() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    phone: "",
    university: "",
    graduationStart: "",
    graduationEnd: "",
    currentGPA: "",
    education: "",
    skills: "",
    experience: "",
    certifications: "",
    strengths: "",
    projects: "",
    achievements: "",
  });

  const [resumeContent, setResumeContent] = useState("");
  const [suggestionsContent, setSuggestionsContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedResumeContent, setEditedResumeContent] = useState(""); // New state for edited content

  const escapeHTML = (text) => {
    return text
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/\n/g, "<br>");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setShowResults(false);

    const prompt = `
Create a detailed, structured resume based on the following details. 
1. Include a clear professional summary at the top.
2. For the experience section, describe the responsibilities in depth, including specific skills and tools used.
3. For each project, provide an overview of the impact and challenges faced.
4. Expand on the achievements, with metrics and concrete examples of success.
Then, clearly list exactly 3 improvement suggestions under the heading 'Suggestions'. Do not add Star "*" symbol anywhere. Give the content in a structured manner.

Name: ${formData.name}
Email: ${formData.email}
Linkedin: ${formData.linkedin}
Phone: ${formData.phone}
University: ${formData.university}
Graduation Start: ${formData.graduationStart}
Graduation End: ${formData.graduationEnd}
Current GPA: ${formData.currentGPA}
Education: ${formData.education}
Skills: ${formData.skills}
Experience: ${formData.experience}
Certifications: ${formData.certifications}
Strengths: ${formData.strengths}
Projects: ${formData.projects}
Achievements: ${formData.achievements}
`;

    try {
      const response = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer nybKSeMjDegp49u2Fq6xXPnBPeQuUd1AwPEs3bJX`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command",
          prompt: prompt,
          max_tokens: 1300,
          temperature: 0.6,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API request failed with status ${response.status}: ${errorData.message || "Unknown error"}`
        );
      }

      const result = await response.json();
      const text = result.generations?.[0]?.text || "AI did not return a result.";

      const splitIndex = text.toLowerCase().indexOf("suggestion");
      const resumeText = splitIndex !== -1 ? text.slice(0, splitIndex).trim() : text.trim();
      const suggestionText = splitIndex !== -1 ? text.slice(splitIndex).trim() : "No suggestions provided.";

      setResumeContent(resumeText);
      setEditedResumeContent(resumeText); // Initialize edited content
      setSuggestionsContent(suggestionText);
      setShowResults(true);
      setIsEditing(false); // Reset edit mode
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(`Failed to generate resume: ${error.message}`);
      setResumeContent("");
      setEditedResumeContent("");
      setSuggestionsContent("");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF using jsPDF
  const handleDownload = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    const addSection = (title, content, isSubSection = false) => {
      // Add section or subsection title
      doc.setFont("courier", "bold");
      doc.setFontSize(isSubSection ? 12 : 14);
      doc.setTextColor(0, 0, 0); // Black color
      doc.text(title, margin, y);
      const titleWidth = doc.getTextWidth(title);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 1, margin + titleWidth, y + 1); // Underline
      y += isSubSection ? 6 : 8;

      // Add section content
      if (content.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0); // Reset to black
        const lines = doc.splitTextToSize(content, maxWidth);
        lines.forEach((line) => {
          if (y + 6 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 6;
        });
      }
      y += 6; // Space after section
    };

    // Document title
    doc.setFont("courier", "bold");
    doc.setFontSize(16);
    doc.text("My Resume", margin, y);
    y += 10;

    // Clean resumeContent by removing introductory line
    let cleanedResumeContent = editedResumeContent.replace(
      /Here is a structured resume for .*? based on the details provided:/i,
      ""
    ).trim();

    // Split resumeContent into sections
    const resumeSections = cleanedResumeContent.split(
      /\n\s*(?=(?:Professional Summary|Experience|Education|Skills|Certifications|Achievements|Projects)\b)/i
    );
    resumeSections.forEach((section) => {
      const lines = section.trim().split("\n");
      const title = lines[0].trim();
      const content = lines.slice(1).join("\n").trim();

      // Check if the title is "Achievements" or "Projects" for semi-bold
      const isSubSection = ["Achievements", "Projects"].some((t) =>
        title.toLowerCase().startsWith(t.toLowerCase())
      );
      addSection(title, content, isSubSection);
    });

    doc.save("My_AI_Resume.pdf");
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      // Save changes when exiting edit mode
      setEditedResumeContent(editedResumeContent);
    }
  };

  const handleResumeEdit = (e) => {
    setEditedResumeContent(e.target.value);
  };

  const shareText = encodeURIComponent(
    `Check out my AI-generated resume!\n${resumeContent.substring(0, 150)}...`
  );
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://yourwebsite.com&summary=${shareText}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-200`}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl md:text-3xl font-semibold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}>
            Resume Builder
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-white hover:bg-gray-100 text-gray-800"
            } shadow-md`}
          >
            {isDarkMode ? "🌞" : "🌙"}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 p-6 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {Object.keys(formData).map((key) => (
            <div key={key} className="space-y-2">
              <label
                htmlFor={key}
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {key === "graduationStart"
                  ? "Start Date (e.g., Sept 2022)"
                  : key === "graduationEnd"
                  ? "Expected Graduation Date (e.g., May 2026)"
                  : key.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() +
                    key.replace(/([A-Z])/g, " $1").slice(1).toLowerCase()}
              </label>
              <textarea
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
                } focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500`}
                type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                required={key === "name" || key === "email"}
                rows={key === "experience" || key === "projects" || key === "education" ? "4" : "2"}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <ClipLoader color="#ffffff" size={20} className="mr-2" />
                Generating...
              </span>
            ) : (
              "Generate Resume"
            )}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-6 p-4 rounded-md bg-red-100 border border-red-400 text-red-700">
            {errorMessage}
          </div>
        )}

        {showResults && (
          <div
            className={`mt-8 rounded-lg shadow-lg overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  Your Resume
                </h2>
                <button
                  onClick={handleEditToggle}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
              {isEditing ? (
                <textarea
                  value={editedResumeContent}
                  onChange={handleResumeEdit}
                  className={`w-full h-[500px] p-4 rounded-md border transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                />
              ) : (
                <div
                  className={`prose max-w-none ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                  dangerouslySetInnerHTML={{ __html: escapeHTML(editedResumeContent) }}
                />
              )}

              <h2 className={`text-xl font-semibold mt-8 mb-4 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
                AI Suggestions
              </h2>
              <div
                className={`prose max-w-none ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
                dangerouslySetInnerHTML={{ __html: escapeHTML(suggestionsContent) }}
              />

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={handleDownload}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  } shadow-md`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-[#0A66C2] hover:bg-[#004182] text-white"
                      : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                  } shadow-md`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  Share on LinkedIn
                </a>
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-[#1DA1F2] hover:bg-[#0c85d0] text-white"
                      : "bg-[#1DA1F2] hover:bg-[#0c85d0] text-white"
                  } shadow-md`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on Twitter
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}