const init = function () {
  console.log('Content script is running');

  // Function to save input values to local storage
  const saveInputValues = function () {
    // Select all input elements for SP
    const inputElements = document.querySelectorAll('.sp-input');

    // Loop through each input element
    inputElements.forEach((inputElement) => {
      // Get the data-issue-id attribute value of the input element's parent div
      const issueId = inputElement
        .closest('.sp-container')
        .getAttribute('data-issue-id');

      // Save the value of the input element to local storage using the issueId as a key
      localStorage.setItem(`sp-input-${issueId}`, inputElement.value);
    });

    // Save the capacity input value to local storage
    const capacityInput = document.querySelector('.sp-capacity-input');
    localStorage.setItem('sp-capacity-input', capacityInput.value);
  };

  // Event listener to save input values to local storage when they change
  document.addEventListener('change', function (event) {
    const target = event.target;
    if (
      target &&
      (target.classList.contains('sp-input') ||
        target.classList.contains('sp-capacity-input'))
    ) {
      saveInputValues();
    }
  });

  // Function to calculate total SP
  const calculateTotal = function () {
    // Select the capacity input element
    const capacityInput = document.querySelector('.sp-capacity-input');
    const capacityValue = parseFloat(capacityInput.value) || 0;

    // Select all input elements for SP
    const inputElements = document.querySelectorAll('.sp-input');
    let totalSP = capacityValue;

    // Loop through each input element
    inputElements.forEach((inputElement) => {
      // Get the value of the input element
      const value = parseFloat(inputElement.value) || 0;

      // Add the value to the total SP
      totalSP -= value;
    });

    // Round the total SP to two decimal places
    totalSP = Math.round(totalSP * 100) / 100;

    // Update the total SP badge
    updateTotalSPBadge(totalSP);
  };

  // Function to add custom div inside the parent div hierarchy
  const addCustomDiv = function () {
    // Check if the custom div already exists
    const existingDiv = document.querySelector(
      '.ghx-sprint-planned .js-sprint-header .ghx-controls.aui-group .capacity-container'
    );

    // If the custom div does not exist, create and add it
    if (!existingDiv) {
      // Selecting the parent sprint block element
      const sprintBlock = document.querySelector('.ghx-sprint-planned');

      if (sprintBlock) {
        // Selecting the js-sprint-header div within the sprint block
        const sprintHeaderDiv = sprintBlock.querySelector('.js-sprint-header');

        if (sprintHeaderDiv) {
          // Selecting the ghx-controls aui-group div within the sprint header div
          const controlsGroupDiv = sprintHeaderDiv.querySelector(
            '.ghx-controls.aui-group'
          );

          if (controlsGroupDiv) {
            // Creating a new div
            const newDiv = document.createElement('div');
            newDiv.className = 'capacity-container'; // Adding class name for styling

            // Creating a new <p> element inside the new div
            const newParagraph = document.createElement('p');
            newParagraph.textContent = 'Sprint Capacity'; // Text content for the <p> element

            // Appending the new <p> element inside the new div
            newDiv.appendChild(newParagraph);

            const newInput = document.createElement('input');
            newInput.type = 'number';
            newInput.placeholder = 'Enter SP';
            newInput.className = 'sp-capacity-input';
            newInput.addEventListener('input', calculateTotal); // Add event listener for input event

            // Appending the new <p> element inside the new div
            newDiv.appendChild(newInput);

            // Inserting the new div at the beginning of the controlsGroupDiv
            controlsGroupDiv.insertBefore(newDiv, controlsGroupDiv.firstChild);
          }
        }
      }
    }
  };

  addCustomDiv();

  // Function to add additional <span> element
  const addAdditionalSpan = function () {
    const existingSpan = document.querySelector(
      '.ghx-sprint-planned .ghx-stat-total .sp-value'
    );

    // If the additional span does not exist, create and add it
    if (!existingSpan) {
      // Selecting the parent sprint block element
      const sprintBlock = document.querySelector('.ghx-sprint-planned');

      if (sprintBlock) {
        // Selecting the ghx-stat-total div within the sprint block
        const statTotalDiv = sprintBlock.querySelector('.ghx-stat-total');

        if (statTotalDiv) {
          // Creating a new <span> element
          const newSpan = document.createElement('span');
          newSpan.className = 'ghx-label'; // Adding class name for styling

          // Setting text content for the new <span> element
          newSpan.textContent = 'Capacity left';

          // Appending the new <span> element to the ghx-stat-total div
          statTotalDiv.appendChild(newSpan);

          const newBadge = document.createElement('aui-badge');
          newBadge.className = 'sp-value';
          newBadge.textContent = '0';

          // Appending the new <span> element to the ghx-stat-total div
          statTotalDiv.appendChild(newBadge);
        }
      }
    }
  };

  // Initial handling of aditional span changes
  addAdditionalSpan();

  // Function to update total SP badge
  const updateTotalSPBadge = function (totalSP) {
    const badge = document.querySelector('.ghx-stat-total .sp-value');
    if (badge) {
      badge.textContent = totalSP || '0'; // Display total SP or '0' if null
    }
  };

  const addSPValueElement = function (taskElement) {
    // Get the data-issue-id attribute value of the task element
    const issueId = taskElement.getAttribute('data-issue-id');

    // Check if the issueId is null or empty
    if (!issueId) {
      return; // If issueId is null or empty, exit the function
    }

    // Check if the task element already has the custom attribute set
    if (!taskElement.getAttribute('data-sp-added')) {
      // Creating a new <div> element
      const containerDiv = document.createElement('div');
      containerDiv.className = 'sp-container'; // Adding a class for styling
      containerDiv.setAttribute('data-issue-id', issueId); // Set data-issue-id attribute

      // Creating a new <p> element
      const newElement = document.createElement('p');
      newElement.textContent = 'Leftovers'; // Text content for the <p> element

      // Appending the new <p> element inside the container div
      containerDiv.appendChild(newElement);

      // Creating a new <input> element for integers
      const inputElement = document.createElement('input');
      inputElement.type = 'number'; // Setting input type to number
      inputElement.placeholder = 'Enter SP'; // Placeholder text for the input
      inputElement.className = 'sp-input'; // Adding a class for styling
      inputElement.addEventListener('input', calculateTotal); // Add event listener for input event

      // Appending the new <input> element inside the container div
      containerDiv.appendChild(inputElement);

      // Appending the container div next to the task element
      taskElement.parentNode.insertBefore(
        containerDiv,
        taskElement.nextSibling
      );

      // Set the custom attribute to mark that the <div> element is added to this task element
      taskElement.setAttribute('data-sp-added', 'true');
    }
  };

  // Adding CSS styling
  const style = document.createElement('style');
  style.textContent = `
    .sp-container {
      display: flex; /* Display elements inline */
      margin-right: 5px; /* Add spacing between elements */
      justify-content: flex-end;
      margin-top: -2rem;
      margin-bottom: 0.5rem;
      position: relative;
    }

    .sp-input {
      width: 60px; /* Set width for the input */
      margin-left: 5px; /* Add spacing between elements */
    }

    .capacity-container{
        display: flex; /* Display elements inline */
      margin-right: 5px; /* Add spacing between elements */
    }

    .sp-capacity-input {
        width: 60px; /* Set width for the input */
        margin-left: 5px; /* Add spacing between elements */
      }
  `;
  document.head.appendChild(style);

  // Function to handle changes to the parent component
  const handleParentChanges = function () {
    // Selecting the parent sprint block element
    const sprintBlock = document.querySelector('.ghx-sprint-planned');

    if (sprintBlock) {
      // Selecting all task elements inside the sprint block
      const taskElements = sprintBlock.querySelectorAll(
        '.js-issue.js-sortable.js-parent-drag.ghx-issue-compact'
      );

      // Loop through each task element and add the "Enter SP value" element
      taskElements.forEach((taskElement) => {
        const issueId = taskElement.getAttribute('data-issue-id');
        // Check if the task element already has the related div added
        const existingDiv = document.querySelector(
          `.sp-container[data-issue-id="${issueId}"]`
        );

        if (!existingDiv) {
          // If not, add the related div
          addSPValueElement(taskElement);
        }
      });
    }
  };

  // Initial handling of parent changes
  handleParentChanges();

  // Function to load input values from local storage
  const loadInputValues = function () {
    // Select all input elements for SP
    const inputElements = document.querySelectorAll('.sp-input');

    // Loop through each input element
    inputElements.forEach((inputElement) => {
      // Get the data-issue-id attribute value of the input element's parent div
      const issueId = inputElement
        .closest('.sp-container')
        .getAttribute('data-issue-id');

      // Get the value from local storage based on the issueId
      const storedValue = localStorage.getItem(`sp-input-${issueId}`);

      // If a value is found in local storage, set the input element's value to it
      if (storedValue !== null) {
        inputElement.value = storedValue;
      }
    });

    // Load the capacity input value from local storage
    const capacityInput = document.querySelector('.sp-capacity-input');
    const storedCapacityValue = localStorage.getItem('sp-capacity-input');
    if (storedCapacityValue !== null) {
      capacityInput.value = storedCapacityValue;
    }

    calculateTotal();
  };

  // Call the function to load input values when the page loads
  loadInputValues();

  // MutationObserver to monitor changes to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Handle changes to the parent component
      handleParentChanges();
      // Add the additional span
      addAdditionalSpan();
      addCustomDiv();

      mutation.target.querySelectorAll('.sp-input').forEach((inputElement) => {
        const issueId = inputElement
          .closest('.sp-container')
          .getAttribute('data-issue-id');
        if (issueId) {
          // Call the function to load input values
          loadInputValues();
          return; // Exit the loop if one input field is found
        }
      });
    });
  });

  // Selecting the parent sprint block element to observe mutations
  const sprintBlock = document.querySelector('.ghx-sprint-planned');
  if (sprintBlock) {
    observer.observe(sprintBlock, { childList: true, subtree: true });
  }
};

setTimeout(init, 3000);
