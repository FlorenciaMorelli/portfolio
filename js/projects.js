document.addEventListener("DOMContentLoaded", async function () {
    const projectContainer = document.getElementById("projectContainer");
    const filterButtons = document.querySelectorAll("#filters button");

    async function fetchProjects() {
        try {
            const response = await fetch("data/projects.json");
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

            const linksDiv = document.createElement("div");
            linksDiv.classList.add("projectLinks");

            project.links.forEach(link => {
                const linkElement = document.createElement("a");
                linkElement.href = link.url;
                linkElement.target = "_blank";

                let icon;
                if (link.type === "repo") {
                    icon = "assets/img/github.svg";
                } else if (link.type === "download") {
                    icon = "assets/img/download.svg";
                } else if (link.type === "website") {
                    icon = "assets/img/browser.svg";
                } else if (link.type === "presentation") {
                    icon = "assets/img/presentation.png";
                } else if (link.type === "figma") {
                    icon = "assets/img/figma.svg";
                }

                let text;
                if (link.type === "repo") {
                    text = "View repository on GitHub";
                } else if (link.type === "download") {
                    text = "Download";
                } else if (link.type === "website") {
                    text = "Visit site";
                } else if (link.type === "presentation") {
                    text = "View presentation";
                } else if (link.type === "figma") {
                    text = "View on Figma";
                }

                const img = document.createElement("img");
                img.src = icon;
                img.alt = link.type;

                const tooltip = document.createElement("div");
                tooltip.classList.add("tooltip");
                tooltip.appendChild(img);
                const tooltipText = document.createElement("span");
                tooltipText.classList.add("tooltiptext");
                tooltipText.innerText = text;
                tooltip.appendChild(tooltipText);
                linkElement.appendChild(tooltip);

                linksDiv.appendChild(linkElement);
            });

            projectCard.innerHTML = `
                <div class="projectCardTop">
                    <div class="projectTechnologies">${techList}</div>
                    <div class="projectLinks">${linksDiv.outerHTML}</div>
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

    function filterProjects(category) {
        const filteredProjects = category === 'All' ? projects : projects.filter(p => p.category === category);
        renderProjects(filteredProjects);
    }

    const projects = await fetchProjects();
    renderProjects(projects.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    }));

    filterButtons.forEach(button => {
        button.addEventListener("click", function () {
            filterButtons.forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");

            const category = button.textContent;
            filterProjects(category);
        });
    });
});
