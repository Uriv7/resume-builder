"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";
import jsPDF from "jspdf";

export default function ManualResume() {
  const [activeTemplate, setActiveTemplate] = useState("modern");
  const [formData, setFormData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        school: "",
        location: "",
        graduationDate: "",
        gpa: "",
      },
    ],
    skills: [""],
    projects: [
      {
        name: "",
        description: "",
        technologies: "",
        link: "",
        achievements: "",
      },
    ],
    achievements: [
      {
        title: "",
        description: "",
        date: "",
      },
    ],
    certifications: [
      {
        name: "",
        issuer: "",
        date: "",
        expiry: "",
        credentialId: "",
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }));
  };

  const handleArrayFieldChange = (section, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayField = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], { ...prev[section][0] }],
    }));
  };

  const removeArrayField = (section, index) => {
    if (formData[section].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSkillChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const removeSkill = (index) => {
    if (formData.skills.length > 1) {
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index),
      }));
    }
  };

  const handleDownload = () => {
    setIsLoading(true);
    const doc = new jsPDF();
    
    if (activeTemplate === "modern") {
      // Modern template - Clean and minimalist design
      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185); // Blue header
      doc.text(formData.personalInfo.name, 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray text
      const contactInfo = [
        formData.personalInfo.email,
        formData.personalInfo.phone,
        formData.personalInfo.location,
        formData.personalInfo.linkedin,
      ].filter(Boolean).join(" | ");
      doc.text(contactInfo, 20, 30);
      
      let yPos = 45;
      
      // Summary
      if (formData.summary) {
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Professional Summary", 20, yPos);
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const splitSummary = doc.splitTextToSize(formData.summary, 170);
        doc.text(splitSummary, 20, yPos + 8);
        yPos += 20 + (splitSummary.length * 5);
      }
      
      // Experience
      if (formData.experience.some(exp => exp.title || exp.company)) {
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Experience", 20, yPos);
        yPos += 10;
        
        formData.experience.forEach((exp) => {
          if (exp.title || exp.company) {
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(exp.title, 20, yPos);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`, 20, yPos + 5);
            const splitDesc = doc.splitTextToSize(exp.description, 170);
            doc.text(splitDesc, 20, yPos + 12);
            yPos += 25 + (splitDesc.length * 5);
          }
        });
      }
      
      // Projects
      if (formData.projects.some(proj => proj.name)) {
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Projects", 20, yPos);
        yPos += 10;
        
        formData.projects.forEach((proj) => {
          if (proj.name) {
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(proj.name, 20, yPos);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const splitDesc = doc.splitTextToSize(proj.description, 170);
            doc.text(splitDesc, 20, yPos + 7);
            doc.text(`Technologies: ${proj.technologies}`, 20, yPos + 15 + (splitDesc.length * 5));
            yPos += 25 + (splitDesc.length * 5);
          }
        });
      }
      
      // Add a new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Achievements
      if (formData.achievements.some(ach => ach.title)) {
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Achievements", 20, yPos);
        yPos += 10;
        
        formData.achievements.forEach((ach) => {
          if (ach.title) {
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(ach.title, 20, yPos);
            const splitDesc = doc.splitTextToSize(ach.description, 170);
            doc.setFontSize(10);
            doc.text(splitDesc, 20, yPos + 7);
            yPos += 20 + (splitDesc.length * 5);
          }
        });
      }
      
      // Certifications
      if (formData.certifications.some(cert => cert.name)) {
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Certifications", 20, yPos);
        yPos += 10;
        
        formData.certifications.forEach((cert) => {
          if (cert.name) {
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(cert.name, 20, yPos);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`${cert.issuer} | ${cert.date}`, 20, yPos + 5);
            if (cert.credentialId) {
              doc.text(`Credential ID: ${cert.credentialId}`, 20, yPos + 10);
            }
            yPos += 20;
          }
        });
      }
      
    } else {
      // Classic template - Traditional and formal design
      // Header with border
      doc.setDrawColor(0);
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text(formData.personalInfo.name, 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      const contactInfo = [
        formData.personalInfo.email,
        formData.personalInfo.phone,
        formData.personalInfo.location,
      ].filter(Boolean).join(" | ");
      doc.text(contactInfo, 105, 30, { align: "center" });
      
      let yPos = 50;
      
      // Summary with underlined heading
      if (formData.summary) {
        doc.setFontSize(14);
        doc.text("PROFESSIONAL SUMMARY", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(formData.summary, 170);
        doc.text(splitSummary, 20, yPos + 10);
        yPos += 20 + (splitSummary.length * 5);
      }
      
      // Experience
      if (formData.experience.some(exp => exp.title || exp.company)) {
        doc.setFontSize(14);
        doc.text("PROFESSIONAL EXPERIENCE", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 10;
        
        formData.experience.forEach((exp) => {
          if (exp.title || exp.company) {
            doc.setFontSize(12);
            doc.text(`${exp.title.toUpperCase()}`, 20, yPos);
            doc.setFontSize(10);
            doc.text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`, 20, yPos + 5);
            const splitDesc = doc.splitTextToSize(exp.description, 170);
            doc.text(splitDesc, 25, yPos + 12);
            yPos += 25 + (splitDesc.length * 5);
          }
        });
      }
      
      // Add page break if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Projects with bullet points
      if (formData.projects.some(proj => proj.name)) {
        doc.setFontSize(14);
        doc.text("PROJECTS", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 10;
        
        formData.projects.forEach((proj) => {
          if (proj.name) {
            doc.setFontSize(12);
            doc.text(`• ${proj.name}`, 20, yPos);
            doc.setFontSize(10);
            const splitDesc = doc.splitTextToSize(proj.description, 165);
            doc.text(splitDesc, 25, yPos + 7);
            doc.text(`Technologies: ${proj.technologies}`, 25, yPos + 15 + (splitDesc.length * 5));
            yPos += 25 + (splitDesc.length * 5);
          }
        });
      }
      
      // Achievements with bullet points
      if (formData.achievements.some(ach => ach.title)) {
        doc.setFontSize(14);
        doc.text("ACHIEVEMENTS", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 10;
        
        formData.achievements.forEach((ach) => {
          if (ach.title) {
            doc.setFontSize(10);
            doc.text(`• ${ach.title}`, 20, yPos);
            const splitDesc = doc.splitTextToSize(ach.description, 165);
            doc.text(splitDesc, 25, yPos + 7);
            yPos += 20 + (splitDesc.length * 5);
          }
        });
      }
      
      // Certifications in a compact format
      if (formData.certifications.some(cert => cert.name)) {
        doc.setFontSize(14);
        doc.text("CERTIFICATIONS", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 10;
        
        formData.certifications.forEach((cert) => {
          if (cert.name) {
            doc.setFontSize(10);
            doc.text(`• ${cert.name} - ${cert.issuer}`, 20, yPos);
            doc.text(`  ${cert.date}${cert.credentialId ? ` | ID: ${cert.credentialId}` : ""}`, 25, yPos + 5);
            yPos += 15;
          }
        });
      }
    }
    
    doc.save(`${formData.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Manual Resume Builder
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Choose Template
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTemplate("modern")}
                  className={`px-4 py-2 rounded-md ${
                    activeTemplate === "modern"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Modern
                </button>
                <button
                  onClick={() => setActiveTemplate("classic")}
                  className={`px-4 py-2 rounded-md ${
                    activeTemplate === "classic"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Classic
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h2>
              <div className="space-y-4">
                {Object.entries(formData.personalInfo).map(([key, value]) => (
                  <div key={key}>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      htmlFor={key}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type={key === "email" ? "email" : "text"}
                      id={key}
                      name={key}
                      value={value}
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Professional Summary
              </h2>
              <textarea
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={4}
              />
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Experience
                </h2>
                <button
                  onClick={() => addArrayField("experience")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Experience
                </button>
              </div>
              {formData.experience.map((exp, index) => (
                <div key={index} className="space-y-4 mb-6 pb-6 border-b dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeArrayField("experience", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  {Object.entries(exp).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {key === "description" ? (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              index,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          rows={4}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              index,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Education
                </h2>
                <button
                  onClick={() => addArrayField("education")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Education
                </button>
              </div>
              {formData.education.map((edu, index) => (
                <div key={index} className="space-y-4 mb-6 pb-6 border-b dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeArrayField("education", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  {Object.entries(edu).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "education",
                            index,
                            key,
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Skills
                </h2>
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Skill
                </button>
              </div>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Projects Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Projects
                </h2>
                <button
                  onClick={() => addArrayField("projects")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Project
                </button>
              </div>
              {formData.projects.map((project, index) => (
                <div key={index} className="space-y-4 mb-6 pb-6 border-b dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeArrayField("projects", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  {Object.entries(project).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {key === "description" || key === "achievements" ? (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "projects",
                              index,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          rows={4}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "projects",
                              index,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Achievements Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Achievements
                </h2>
                <button
                  onClick={() => addArrayField("achievements")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Achievement
                </button>
              </div>
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="space-y-4 mb-6 pb-6 border-b dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeArrayField("achievements", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  {Object.entries(achievement).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      {key === "description" ? (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "achievements",
                              index,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          rows={4}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "achievements",
                              index,
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Certifications Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Certifications
                </h2>
                <button
                  onClick={() => addArrayField("certifications")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Certification
                </button>
              </div>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="space-y-4 mb-6 pb-6 border-b dark:border-gray-700">
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeArrayField("certifications", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  {Object.entries(cert).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type={key.includes("date") ? "date" : "text"}
                        value={value}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "certifications",
                            index,
                            key,
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <ClipLoader color="#ffffff" size={20} className="mr-2" />
                  Generating PDF...
                </span>
              ) : (
                "Download Resume"
              )}
            </button>
          </div>

          {/* Preview Section */}
          <div className="lg:block hidden">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Preview
                </h2>
                <div className="aspect-[8.5/11] bg-white dark:bg-gray-700 rounded-lg shadow-inner p-8 overflow-auto">
                  <div className="space-y-6">
                    {/* Preview Header */}
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formData.personalInfo.name}
                      </h1>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {formData.personalInfo.email && (
                          <span className="mr-2">{formData.personalInfo.email}</span>
                        )}
                        {formData.personalInfo.phone && (
                          <span className="mr-2">{formData.personalInfo.phone}</span>
                        )}
                        {formData.personalInfo.location && (
                          <span>{formData.personalInfo.location}</span>
                        )}
                      </div>
                    </div>

                    {/* Preview Summary */}
                    {formData.summary && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Professional Summary
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{formData.summary}</p>
                      </div>
                    )}

                    {/* Preview Experience */}
                    {formData.experience.some((exp) => exp.title || exp.company) && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Experience
                        </h2>
                        {formData.experience.map(
                          (exp, index) =>
                            (exp.title || exp.company) && (
                              <div key={index} className="mb-4">
                                <div className="flex justify-between">
                                  <strong className="text-sm text-gray-800 dark:text-gray-200">{exp.title}</strong>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {exp.startDate} - {exp.endDate}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">{exp.company}</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {/* Preview Education */}
                    {formData.education.some((edu) => edu.degree || edu.school) && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Education
                        </h2>
                        {formData.education.map(
                          (edu, index) =>
                            (edu.degree || edu.school) && (
                              <div key={index} className="mb-4">
                                <div className="flex justify-between">
                                  <strong className="text-sm text-gray-800 dark:text-gray-200">{edu.degree}</strong>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {edu.graduationDate}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">{edu.school}</div>
                                {edu.gpa && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">GPA: {edu.gpa}</div>
                                )}
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {/* Preview Skills */}
                    {formData.skills.some((skill) => skill) && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Skills
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formData.skills.filter((skill) => skill).join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Preview Projects */}
                    {formData.projects.some((proj) => proj.name) && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Projects
                        </h2>
                        {formData.projects.map(
                          (proj, index) =>
                            proj.name && (
                              <div key={index} className="mb-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{proj.name}</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{proj.description}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Technologies: {proj.technologies}</p>
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {/* Preview Achievements */}
                    {formData.achievements.some((ach) => ach.title) && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Achievements
                        </h2>
                        {formData.achievements.map(
                          (ach, index) =>
                            ach.title && (
                              <div key={index} className="mb-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{ach.title}</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{ach.description}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{ach.date}</p>
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {/* Preview Certifications */}
                    {formData.certifications.some((cert) => cert.name) && (
                      <div>
                        <h2 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-500 mb-2 pb-1 text-gray-900 dark:text-white">
                          Certifications
                        </h2>
                        {formData.certifications.map(
                          (cert, index) =>
                            cert.name && (
                              <div key={index} className="mb-4">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{cert.name}</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{cert.issuer}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{cert.date}</p>
                                {cert.credentialId && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Credential ID: {cert.credentialId}</p>
                                )}
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
