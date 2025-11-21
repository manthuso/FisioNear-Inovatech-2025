document.addEventListener("DOMContentLoaded", () => {

    const ctx = document.getElementById("graficoEvolucao");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
            datasets: [
                {
                    label: "Exercícios Concluídos (%)",
                    data: [40, 55, 70, 90],
                    borderWidth: 3,
                    borderColor: "#1BB55C",
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });

});
