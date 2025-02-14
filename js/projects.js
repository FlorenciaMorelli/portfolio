document.addEventListener("DOMContentLoaded", async function () {
    const projectContainer = document.getElementById("projectContainer");
    const filterSelect = document.getElementById("filters");

    async function fetchProjects() {
        try {
            const response = await fetch("../data/projects.json");
            const data = await response.json();
            return data.projects;
        } catch (error) {
            console.error("Error loading projects:", error);
            return [];
        }
    }

    function renderProjects(projects) {
        projectContainer.innerHTML = "";
        projects.forEach(project => {
            const projectCard = document.createElement("div");
            projectCard.classList.add("projectCard");

            const techList = project.technologies.map(tech => `<span class="projectTechnology">${tech}</span>`).join(" ");

            projectCard.innerHTML = `
                <div class="projectCardTop">
                        <div class="projectTechnologies">
                            ${techList}
                        </div>
                        <div class="projectLinks">
                            <a href="${project.repo}" target="_blank">
                                <div class="tooltip">
                                    <img src="assets/img/github.svg" alt="Github Logo">
                                    <span class="tooltiptext">View repository on GitHub</span>
                                </div>
                            </a>
                            ${project.download ? `<a href="${project.download}" target="_blank">
                                <div class="tooltip">
                                    <img src="assets/img/download.svg" alt="Download">
                                    <span class="tooltiptext">Download</span>
                                </div>
                            </a>` : ""}
                        </div>
                    </div>
                    <div class="projectInfo">
                        <div class="projectTitle">
                            <h3>${project.name}</h3>
                            <h5>${project.institution}</h5>
                        </div>
                            <p>${project.description}</p>
                        <img class="projectImg" src="${project.image}" alt="${project.name}">
                    </div>
            `;
            projectContainer.appendChild(projectCard);
        });
    }

    function filterProjects(projects, category) {
        return category ? projects.filter(p => p.category === category) : projects;
    }

    const projects = await fetchProjects();
    renderProjects(projects.sort((a, b) => (b.year || 0) - (a.year || 0)));
});
