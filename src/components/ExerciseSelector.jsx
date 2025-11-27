import React from 'react';
import { FaClock, FaBullseye, FaArrowRight, FaDumbbell, FaRunning, FaChild } from 'react-icons/fa';

const availableExercises = [
  {
    id: "biceps",
    name: "Rosca Direta",
    description: "Exercício clássico para fortalecimento do bíceps.",
    instructions: [
      "Fique em pé com postura ereta",
      "Segure os halteres com as palmas para frente",
      "Flexione os cotovelos levantando o peso",
      "Desça controladamente",
    ],
    duration: 300,
    targetPoses: ["flexione o cotovelo", "estenda o cotovelo"],
    icon: <FaDumbbell size={24} />,
    color: "#10b981" 
  },
  {
    id: "squat",
    name: "Agachamento",
    description: "Fortalecimento de pernas e glúteos.",
    instructions: [
      "Pés na largura dos ombros",
      "Agache como se fosse sentar em uma cadeira",
      "Mantenha os joelhos alinhados com os pés",
      "Suba contraindo os glúteos",
    ],
    duration: 300,
    targetPoses: ["agache-se", "levante"],
    icon: <FaRunning size={24} />,
    color: "#3b82f6" 
  },
  {
    id: "stretching",
    name: "Alongamento de Braços",
    description: "Alongamento de braços acima da cabeça.",
    instructions: [
      "Levante os braços acima da cabeça",
      "Mantenha os braços esticados",
      "Segure a posição por 5 segundos",
      "Relaxe e repita",
    ],
    duration: 180,
    targetPoses: ["levante os braços", "segure"],
    icon: <FaChild size={24} />,
    color: "#f59e0b" 
  },
];

export default function ExerciseSelector({ onSelectExercise }) {
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
  };

  return (
    <div className="exercise-selector-container">
      <div className="selector-header">
        <h2>Selecione um Exercício</h2>
        <p>Escolha um exercício para começar sua sessão</p>
      </div>

      <div className="exercise-grid">
        {availableExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="exercise-card"
            onClick={() => onSelectExercise(exercise.id)}
            style={{ borderLeftColor: exercise.color }}
          >
            <div className="card-header">
              <div className="card-title">
                <span className="icon-wrapper" style={{ color: exercise.color, backgroundColor: `${exercise.color}20` }}>
                    {exercise.icon}
                </span>
                <span className="exercise-name">{exercise.name}</span>
              </div>
              <FaArrowRight className="arrow-icon" />
            </div>
            
            <div className="card-content">
              <p className="description">{exercise.description}</p>
              
              <div className="meta-info">
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <span>{formatDuration(exercise.duration)}</span>
                </div>
                <div className="meta-item">
                  <FaBullseye className="meta-icon" />
                  <span>{exercise.instructions.length} etapas</span>
                </div>
              </div>

              <div className="tags">
                {exercise.targetPoses.map((pose, index) => (
                  <span key={index} className="tag">
                    {pose.replace("_", " ")}
                  </span>
                ))}
              </div>

              <button 
                className="start-button-card"
                style={{ '--hover-color': exercise.color }}
              >
                Iniciar Exercício
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
