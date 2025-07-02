import { useState } from 'react';
import { Check, Copy, Plus, Edit3, X, Hamburger, Dumbbell, Scale } from 'lucide-react';

const WellnessPlanner = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'];
  const mealLabels = {
    breakfast: 'Breakfast',
    morningSnack: 'Morning Snack',
    lunch: 'Lunch',
    afternoonSnack: 'Afternoon Snack',
    dinner: 'Dinner'
  };

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editingItem, setEditingItem] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(null);
  
  const [weekPlan, setWeekPlan] = useState(() => {
    const initialPlan = {};
    days.forEach(day => {
      initialPlan[day] = {
        meals: {
          breakfast: { text: '', completed: false },
          morningSnack: { text: '', completed: false },
          lunch: { text: '', completed: false },
          afternoonSnack: { text: '', completed: false },
          dinner: { text: '', completed: false }
        },
        exercise: { text: '', completed: false },
        weight: { value: '', recorded: false }
      };
    });
    return initialPlan;
  });

  const toggleComplete = (day, type, subType = null) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: subType ? {
          ...prev[day][type],
          [subType]: {
            ...prev[day][type][subType],
            completed: !prev[day][type][subType].completed
          }
        } : {
          ...prev[day][type],
          completed: !prev[day][type].completed
        }
      }
    }));
  };

  const updateItem = (day, type, subType, text) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: subType ? {
          ...prev[day][type],
          [subType]: {
            ...prev[day][type][subType],
            text
          }
        } : {
          ...prev[day][type],
          text
        }
      }
    }));
  };

  const startEditing = (day, type, subType = null) => {
    const currentText = subType ? 
      weekPlan[day][type][subType].text : 
      weekPlan[day][type].text;
    setEditingItem({ day, type, subType });
    setNewItemText(currentText);
  };

  const saveEdit = () => {
    if (editingItem) {
      updateItem(editingItem.day, editingItem.type, editingItem.subType, newItemText);
      setEditingItem(null);
      setNewItemText('');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setNewItemText('');
  };

    const copyToOtherDays = (fromDay, type, subType, selectedDays) => {
    let sourceItem;
    
    if (type === 'weight') {
      sourceItem = weekPlan[fromDay].weight;
    } else {
      sourceItem = subType ? 
        weekPlan[fromDay][type][subType] : 
        weekPlan[fromDay][type];
    }
    
    setWeekPlan(prev => {
      const updated = { ...prev };
      selectedDays.forEach(day => {
        if (day !== fromDay) {
          if (type === 'weight') {
            updated[day] = {
              ...updated[day],
              weight: {
                value: sourceItem.value,
                recorded: false
              }
            };
          } else if (subType) {
            updated[day] = {
              ...updated[day],
              [type]: {
                ...updated[day][type],
                [subType]: {
                  text: sourceItem.text,
                  completed: false
                }
              }
            };
          } else {
            updated[day] = {
              ...updated[day],
              [type]: {
                text: sourceItem.text,
                completed: false
              }
            };
          }
        }
      });
      return updated;
    });
    setShowCopyModal(null);
  };

  const CopyModal = ({ item, onClose, onCopy }) => {
    const [selectedDays, setSelectedDays] = useState([]);
    
    const toggleDay = (day) => {
      setSelectedDays(prev => 
        prev.includes(day) 
          ? prev.filter(d => d !== day)
          : [...prev, day]
      );
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Copy to Other Days</h3>
            <button onClick={onClose} className="modal-close">
              <X size={20} />
            </button>
          </div>
          
          <p className="modal-description">
            Select which days to copy "{item.text}" to:
          </p>
          
          <div className="modal-options">
            {days.filter(day => day !== item.day).map(day => (
              <label key={day} className="modal-option">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="modal-checkbox"
                />
                <span className="modal-day-label">{day}</span>
              </label>
            ))}
          </div>
          
          <div className="modal-actions">
            <button
              onClick={() => onCopy(selectedDays)}
              disabled={selectedDays.length === 0}
              className="modal-primary-button"
            >
              Copy to {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
            </button>
            <button
              onClick={onClose}
              className="modal-secondary-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const WeightTracker = ({ day }) => {
    const weight = weekPlan[day].weight;
    const [isEditing, setIsEditing] = useState(false);
    const [weightValue, setWeightValue] = useState(weight.value);

    const saveWeight = () => {
      if (weightValue.trim()) {
        setWeekPlan(prev => ({
          ...prev,
          [day]: {
            ...prev[day],
            weight: {
              value: weightValue.trim(),
              recorded: true
            }
          }
        }));
      }
      setIsEditing(false);
    };

    const cancelEdit = () => {
      setWeightValue(weight.value);
      setIsEditing(false);
    };

    const startEditing = () => {
      setWeightValue(weight.value);
      setIsEditing(true);
    };

    const toggleRecorded = () => {
      if (weight.value) {
        setWeekPlan(prev => ({
          ...prev,
          [day]: {
            ...prev[day],
            weight: {
              ...prev[day].weight,
              recorded: !prev[day].weight.recorded
            }
          }
        }));
      }
    };

    return (
      <div className="item-row">
        <button
          onClick={toggleRecorded}
          className={`checkbox-button ${weight.recorded ? 'completed' : 'incomplete'}`}
          disabled={!weight.value}
        >
          {weight.recorded && <Check size={14} />}
        </button>
        
        <div className="item-content">
          <div className="item-label">Daily Weight</div>
          {isEditing ? (
            <div className="edit-form">
              <input
                type="number"
                step="0.1"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                className="edit-input"
                placeholder="Enter weight (kg or lbs)..."
                autoFocus
              />
              <button onClick={saveWeight} className="edit-button save">
                Save
              </button>
              <button onClick={cancelEdit} className="edit-button cancel">
                Cancel
              </button>
            </div>
          ) : (
            <div className="item-text-container">
              <span className={`item-text ${weight.recorded ? 'completed' : ''} ${!weight.value ? 'placeholder' : ''}`}>
                {weight.value ? `${weight.value} ${weight.value.includes('.') ? 'kg' : 'lbs'}` : 'Click to record weight'}
              </span>
              <div className="item-actions">
                <button
                  onClick={startEditing}
                  className="action-button edit"
                >
                  {weight.value ? <Edit3 size={14} /> : <Plus size={14} />}
                </button>
                {weight.value && (
                  <button
                    onClick={() => setShowCopyModal({ day, type: 'weight', subType: null, text: weight.value })}
                    className="action-button copy"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ItemRow = ({ day, type, subType = null, label }) => {
    const item = subType ? weekPlan[day][type][subType] : weekPlan[day][type];
    const isEditing = editingItem?.day === day && editingItem?.type === type && editingItem?.subType === subType;
    
    return (
      <div className="item-row">
        <button
          onClick={() => toggleComplete(day, type, subType)}
          className={`checkbox-button ${item.completed ? 'completed' : 'incomplete'}`}
        >
          {item.completed && <Check size={14} />}
        </button>
        
        <div className="item-content">
          <div className="item-label">{label}</div>
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="edit-input"
                placeholder={`Enter ${label.toLowerCase()}...`}
                autoFocus
              />
              <button
                onClick={saveEdit}
                className="edit-button save"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="edit-button cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="item-text-container">
              <span className={`item-text ${item.completed ? 'completed' : ''} ${!item.text ? 'placeholder' : ''}`}>
                {item.text || `Click to add ${label.toLowerCase()}`}
              </span>
              <div className="item-actions">
                <button
                  onClick={() => startEditing(day, type, subType)}
                  className="action-button edit"
                >
                  {item.text ? <Edit3 size={14} /> : <Plus size={14} />}
                </button>
                {item.text && (
                  <button
                    onClick={() => setShowCopyModal({ day, type, subType, text: item.text })}
                    className="action-button copy"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentDayPlan = weekPlan[selectedDay];
  const completedMeals = mealTypes.filter(type => currentDayPlan.meals[type].completed).length;
  const completedExercise = currentDayPlan.exercise.completed ? 1 : 0;
  const recordedWeight = currentDayPlan.weight.recorded ? 1 : 0;
  const totalProgress = (completedMeals + completedExercise + recordedWeight) / 7 * 100;

  return (
    <div className="wellness-app">
      <div className="wellness-container">
        <div className="wellness-header">
          <h1 className="wellness-title">Daily Wellness Tracker</h1>
          <p className="wellness-subtitle">Plan your meals and exercise, track your progress</p>
        </div>

        {/* Day Selector */}
        <div className="day-selector">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`day-button ${selectedDay === day ? 'active' : 'inactive'}`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="wellness-card">
          <div className="progress-header">
            <h3 className="progress-title">{selectedDay} Progress</h3>
            <span className="progress-text">{Math.round(totalProgress)}% Complete</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Meals Section */}
        <div className="wellness-card">
          <h2 className="section-header">
            <Hamburger size={22} /><span style={{ marginLeft: '8px' }}>Meals</span>
            <span className="section-counter">({completedMeals}/5)</span>
          </h2>
          <div>
            {mealTypes.map(type => (
              <ItemRow
                key={type}
                day={selectedDay}
                type="meals"
                subType={type}
                label={mealLabels[type]}
              />
            ))}
          </div>
        </div>

        {/* Exercise Section */}
        <div className="wellness-card">
          <h2 className="section-header">
            <Dumbbell size={22} /><span style={{ marginLeft: '8px' }}>Exercise</span>
            <span className="section-counter">({completedExercise}/1)</span>
          </h2>
          <ItemRow
            day={selectedDay}
            type="exercise"
            label="Daily Exercise"
          />
        </div>

        {/* Weight Tracker Section */}
        <div className="wellness-card">
          <h2 className="section-header">
            <Scale size={22} /><span style={{ marginLeft: '8px' }}>Weight Tracker</span>
            <span className="section-counter">({recordedWeight}/1)</span>
          </h2>
          <WeightTracker day={selectedDay} />
        </div>

        {/* Copy Modal */}
        {showCopyModal && (
          <CopyModal
            item={showCopyModal}
            onClose={() => setShowCopyModal(null)}
            onCopy={(selectedDays) => {
              copyToOtherDays(
                showCopyModal.day,
                showCopyModal.type,
                showCopyModal.subType,
                selectedDays
              );
            }}
          />
        )}
      </div>

      <style jsx>{`
        /* Wellness Planner CSS Styles */

        .wellness-app {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #dbeafe, #e0e7ff);
        }

        .wellness-container {
          max-width: 64rem;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        /* Header */
        .wellness-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .wellness-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .wellness-subtitle {
          color: #6b7280;
        }

        /* Day Selector */
        .day-selector {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .day-button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .day-button.active {
          background-color: #2563eb;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .day-button.inactive {
          background-color: white;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .day-button.inactive:hover {
          background-color: #dbeafe;
        }

        /* Card Styles */
        .wellness-card {
          background-color: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        /* Progress Bar */
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .progress-title {
          font-weight: 600;
          color: #111827;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .progress-bar-container {
          width: 100%;
          background-color: #e5e7eb;
          border-radius: 9999px;
          height: 0.75rem;
        }

        .progress-bar {
          background: linear-gradient(to right, #34d399, #059669);
          height: 0.75rem;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        /* Section Headers */
        .section-header {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
        }

        .section-counter {
          margin-left: auto;
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Item Rows */
        .item-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          transition: background-color 0.2s ease;
        }

        .item-row:hover {
          background-color: #f3f4f6;
        }

        .item-row:last-child {
          margin-bottom: 0;
        }

        /* Checkbox Button */
        .checkbox-button {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: none;
          padding: 0;
        }

        .checkbox-button.completed {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }

        .checkbox-button.incomplete {
          border-color: #d1d5db;
          color: transparent;
        }

        .checkbox-button.incomplete:hover {
          border-color: #34d399;
        }

        /* Item Content */
        .item-content {
          flex: 1;
        }

        .item-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .item-text-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .item-text {
          color: #111827;
        }

        .item-text.completed {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .item-text.placeholder {
          color: #9ca3af;
        }

        .item-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-button {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s ease;
        }

        .action-button.edit:hover {
          color: #2563eb;
        }

        .action-button.copy:hover {
          color: #059669;
        }

        /* Edit Form */
        .edit-form {
          display: flex;
          gap: 0.5rem;
        }

        .edit-input {
          flex: 1;
          padding: 0.25rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .edit-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .edit-button {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .edit-button.save {
          background-color: #059669;
          color: white;
        }

        .edit-button.save:hover {
          background-color: #047857;
        }

        .edit-button.cancel {
          background-color: #6b7280;
          color: white;
        }

        .edit-button.cancel:hover {
          background-color: #4b5563;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .modal-content {
          background-color: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          max-width: 28rem;
          width: 100%;
          margin: 1rem;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }

        .modal-close {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .modal-close:hover {
          color: #6b7280;
        }

        .modal-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .modal-options {
          margin-bottom: 1.5rem;
        }

        .modal-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem 0;
        }

        .modal-checkbox {
          width: 1rem;
          height: 1rem;
          accent-color: #2563eb;
          border-radius: 0.25rem;
        }

        .modal-day-label {
          color: #374151;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
        }

        .modal-primary-button {
          flex: 1;
          background-color: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .modal-primary-button:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .modal-primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-secondary-button {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .modal-secondary-button:hover {
          color: #111827;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .wellness-container {
            padding: 1rem 0.5rem;
          }
          
          .wellness-title {
            font-size: 1.5rem;
          }
          
          .day-selector {
            gap: 0.25rem;
          }
          
          .day-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
          
          .wellness-card {
            padding: 1rem;
          }
          
          .item-row {
            padding: 0.5rem;
          }
          
          .modal-content {
            margin: 0.5rem;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WellnessPlanner;