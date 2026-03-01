document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // if there are participants, append a list with delete icons
        if (details.participants && details.participants.length > 0) {
          const participantsHeader = document.createElement("p");
          participantsHeader.innerHTML = "<strong>Participants:</strong>";
          activityCard.appendChild(participantsHeader);

          const list = document.createElement("ul");
          list.className = "participants";
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            // Email span
            const emailSpan = document.createElement("span");
            emailSpan.textContent = email;
            emailSpan.className = "participant-email";
            li.appendChild(emailSpan);

            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant";
            deleteBtn.title = "Remove participant";
            deleteBtn.innerHTML = "&#128465;"; // trash can unicode
            deleteBtn.onclick = async (e) => {
              e.stopPropagation();
              // Call API to remove participant
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: "POST"
                });
                if (res.ok) {
                  fetchActivities();
                  messageDiv.textContent = `Removed ${email} from ${name}`;
                  messageDiv.className = "success";
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => { messageDiv.classList.add("hidden"); }, 3000);
                } else {
                  const result = await res.json();
                  messageDiv.textContent = result.detail || "Failed to remove participant.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => { messageDiv.classList.add("hidden"); }, 3000);
                }
              } catch (err) {
                messageDiv.textContent = "Network error.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => { messageDiv.classList.add("hidden"); }, 3000);
              }
            };
            li.appendChild(deleteBtn);

            list.appendChild(li);
          });
          activityCard.appendChild(list);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
