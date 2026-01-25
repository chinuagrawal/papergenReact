import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const QUESTION_TYPES = [
  "MCQ",
  "Very Short",
  "Short",
  "Long",
  "Numerical",
  "Structured",
  "Assertion",
  "Fill",
  "CaseStudy",
];

function PaperGeneration() {
  const { state: selection } = useLocation();
  const navigate = useNavigate();

  // Paper Settings
  const [totalMarks, setTotalMarks] = useState(100);
  const [duration, setDuration] = useState(180); // minutes

  // Blueprint: { Type: { count: 0, marks: 1 } }
  const [blueprint, setBlueprint] = useState(
    QUESTION_TYPES.reduce((acc, type) => {
      // Set default marks based on type (heuristic)
      let defaultMarks = 1;
      if (type === "MCQ" || type === "Assertion" || type === "Fill")
        defaultMarks = 1;
      else if (type === "Very Short") defaultMarks = 2;
      else if (type === "Short") defaultMarks = 3;
      else if (type === "Long") defaultMarks = 5;
      else if (type === "CaseStudy") defaultMarks = 4;

      acc[type] = { count: 0, marks: defaultMarks };
      return acc;
    }, {}),
  );

  const [calculatedMarks, setCalculatedMarks] = useState(0);

  // Recalculate total marks whenever blueprint changes
  useEffect(() => {
    let total = 0;
    Object.values(blueprint).forEach((item) => {
      const c = parseInt(item.count) || 0;
      const m = parseFloat(item.marks) || 0;
      total += c * m;
    });
    setCalculatedMarks(total);
  }, [blueprint]);

  if (!selection)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600">
        No selection data found. Please go back to dashboard.
      </div>
    );

  const handleBlueprintChange = (type, field, value) => {
    setBlueprint((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleGenerate = () => {
    if (calculatedMarks === 0) {
      alert("Please add at least one question.");
      return;
    }

    const payload = {
      ...selection,
      config: {
        totalMarks,
        duration,
        blueprint,
      },
    };

    console.log("Generating Paper Payload:", payload);
    // TODO: Integrate API
    alert(`Generating paper for ${calculatedMarks} marks... (Check console)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paper Configuration
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Customize your question paper structure
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
              {selection.class?.class_name}
            </div>
            <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">
              {selection.subject?.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Settings & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Paper Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Paper Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks (Target)
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) =>
                      setTotalMarks(parseInt(e.target.value) || 0)
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-xl border ${
                  calculatedMarks === totalMarks
                    ? "bg-green-50 border-green-200 text-green-700"
                    : calculatedMarks > totalMarks
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-yellow-50 border-yellow-200 text-yellow-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">Current Total</span>
                  <span className="text-xl font-bold">{calculatedMarks}</span>
                </div>
                <div className="text-xs text-right">Target: {totalMarks}</div>
              </div>
            </div>

            {/* Selected Chapters Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 max-h-[400px] overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Chapters Included
              </h2>
              <div className="space-y-3">
                {selection.selectedChapters.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold text-gray-700">
                      {item.bookName}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.chapterIds.map((chId) => (
                        <span
                          key={chId}
                          className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                        >
                          ID: {chId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Blueprint Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Question Blueprint
                </h2>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() =>
                    setBlueprint(
                      QUESTION_TYPES.reduce((acc, type) => {
                        acc[type] = { count: 0, marks: 1 };
                        return acc;
                      }, {}),
                    )
                  }
                >
                  Reset All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-sm">
                      <th className="py-3 px-2 font-medium">Type</th>
                      <th className="py-3 px-2 font-medium w-32">Count</th>
                      <th className="py-3 px-2 font-medium w-32">Marks Each</th>
                      <th className="py-3 px-2 font-medium w-24 text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {QUESTION_TYPES.map((type) => {
                      const count = blueprint[type].count;
                      const marks = blueprint[type].marks;
                      const subtotal = count * marks;

                      return (
                        <tr
                          key={type}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-2 font-medium text-gray-700">
                            {type}
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) =>
                                handleBlueprintChange(
                                  type,
                                  "count",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full p-2 border rounded-lg text-center focus:ring-1 focus:ring-blue-400 outline-none"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={marks}
                              onChange={(e) =>
                                handleBlueprintChange(
                                  type,
                                  "marks",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full p-2 border rounded-lg text-center focus:ring-1 focus:ring-blue-400 outline-none"
                            />
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-800">
                            {subtotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-2 font-bold text-gray-800">
                        Total
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-blue-600">
                        {Object.values(blueprint).reduce(
                          (s, i) => s + (parseInt(i.count) || 0),
                          0,
                        )}
                      </td>
                      <td className="py-3 px-2"></td>
                      <td className="py-3 px-2 text-right font-bold text-blue-600 text-lg">
                        {calculatedMarks}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Generate Paper</span>
                  <span className="text-xl">🚀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperGeneration;
