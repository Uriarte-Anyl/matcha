document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lenis with the CDN version
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  const container = document.querySelector(".trail-container");

  const config = {
    imageCount: 6, // Changed to match your trail images
    imageLifeSpan: 750,
    removalDelay: 50,
    mouseThreshold: 100,
    scrollThreshold: 50,
    idleCursorInterval: 300,
    inDuration: 750,
    outDuration: 1000,
    inEasing: "cubic-bezier(.07, .5, .5, 1)",
    outEasing: "cubic-bezier(.87, 0, .13, 1)",
  };

  // SEPARATE IMAGES FOR TRAIL ONLY
  const trailImages = [
    'assets/pic1.jpg',
    'assets/pic2.jpg',
    'assets/pic3.jpg',
    'assets/pic4.jpg',
    'assets/pic5.jpg',
    'assets/pic6.jpg',
    'assets/pic7.jpg',
    'assets/pic8.jpg',
    'assets/pic9.jpg',
    'assets/pic10.jpg',
    'assets/pic11.jpg',
    'assets/pic12.jpg',
    'assets/pic13.jpg',
    'assets/pic14.jpg',
    'assets/pic15.jpg',
    'assets/pic16.jpg',
    'assets/pic17.jpg',
    'assets/pic18.jpg'
  ];

  const trail = [];
  let mouseX = 0,
    mouseY = 0,
    lastMouseX = 0,
    lastMouseY = 0;
  let isMoving = false,
    isCursorInContainer = 0;
  let lastRemovalTime = 0,
    lastSteadyImageTime = 0,
    lastScrollTime = 0;
  let isScrolling = false,
    scrollTicking = false;

  const isInContainer = (x, y) => {
    const rect = container.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  const setInitialMousePos = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    isCursorInContainer = isInContainer(mouseX, mouseY);
    document.removeEventListener("mouseover", setInitialMousePos, false);
  };

  document.addEventListener("mouseover", setInitialMousePos, false);

  const hasMovedEnough = () => {
    const distance = Math.sqrt(
      Math.pow(mouseX - lastMouseX, 2) + Math.pow(mouseY - lastMouseY, 2),
    );
    return distance > config.mouseThreshold;
  };

  const createTrailImage = () => {
    if (!isCursorInContainer) return;

    const now = Date.now();

    if (isMoving && hasMovedEnough()) {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      createImage();
      return;
    }

    if (!isMoving && now - lastSteadyImageTime >= config.idleCursorInterval) {
      lastSteadyImageTime = now;
      createImage();
    }
  };

  const createImage = () => {
    const img = document.createElement("img");
    img.classList.add("trail-img");

    const randomIndex = Math.floor(Math.random() * trailImages.length);
    const rotation = (Math.random() - 0.5) * 50;
    img.src = trailImages[randomIndex]; // Use trail images only

    const rect = container.getBoundingClientRect();
    const relativeX = mouseX - rect.left;
    const relativeY = mouseY - rect.top;

    img.style.left = `${relativeX}px`;
    img.style.top = `${relativeY}px`;
    img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
    img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

    container.appendChild(img);

    setTimeout(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
    }, 10);

    trail.push({
      element: img,
      rotation: rotation,
      removeItem: Date.now() + config.imageLifeSpan,
    });
  };

  const createScrollTrailImage = () => {
    if (!isCursorInContainer) return;

    lastMouseX += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
    lastMouseY += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);

    createImage();

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  };

  const removeOldImages = () => {
    const now = Date.now();

    if (now - lastRemovalTime < config.removalDelay || trail.length === 0)
      return;

    const oldestImage = trail[0];
    if (now >= oldestImage.removeItem) {
      const imgToRemove = trail.shift();

      imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
      imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;

      lastRemovalTime = now;

      setTimeout(() => {
        if (imgToRemove.element.parentNode) {
          imgToRemove.element.parentNode.removeChild(imgToRemove.element);
        }
      }, config.outDuration);
    }
  };

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isCursorInContainer = isInContainer(mouseX, mouseY);

    if (isCursorInContainer) {
      isMoving = true;
      clearTimeout(window.moveTimeout);
      window.moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 100);
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      isCursorInContainer = isInContainer(mouseX, mouseY);

      if (isCursorInContainer) {
        isMoving = true;
        lastMouseX += (Math.random() - 0.5) * 10;

        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
          isMoving = false;
        }, 100);
      }
    },
    { passive: false },
  );

  window.addEventListener(
    "scroll",
    () => {
      const now = Date.now();
      isScrolling = true;

      if (now - lastScrollTime < config.scrollThreshold) return;

      lastScrollTime = now;

      if (!scrollTicking) {
        requestAnimationFrame(() => {
          if (isScrolling) {
            createScrollTrailImage();
            isScrolling = false;
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true },
  );

  const animate = () => {
    createTrailImage();
    removeOldImages();
    requestAnimationFrame(animate);
  };
  animate();
});

// ===================================
// BOUQUET MAKER - COMPLETELY SEPARATE
// ===================================

const dropZone = document.getElementById('drop-zone');
const droppedFlowersContainer = document.getElementById('dropped-flowers');
const finalBouquet = document.getElementById('final-bouquet');
const dropText = document.querySelector('.drop-text');
const draggableFlowers = document.querySelectorAll('.draggable-flower');

let droppedFlowers = new Set();
const totalFlowers = 5;

// Prevent bouquet images from being affected by trail
const bouquetSection = document.querySelector('.wrap-up');
if (bouquetSection) {
  bouquetSection.style.pointerEvents = 'auto';
}

// Drag start
draggableFlowers.forEach(flower => {
  flower.addEventListener('dragstart', (e) => {
    if (!flower.classList.contains('used')) {
      flower.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', flower.dataset.flower);
    }
  });

  flower.addEventListener('dragend', (e) => {
    flower.classList.remove('dragging');
  });
});

// Drag over drop zone
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

// Drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
  
  const flowerType = e.dataTransfer.getData('text/plain');
  
  if (!droppedFlowers.has(flowerType)) {
    droppedFlowers.add(flowerType);
    
    // Create dropped flower element
    const droppedFlower = document.createElement('div');
    droppedFlower.classList.add('dropped-flower');
    
    const img = document.createElement('img');
    // Determine file extension based on flower type
    const fileExtension = flowerType === 'paper' ? 'jpg' : 'png';
    img.src = `assets/${flowerType}.${fileExtension}`;
    img.alt = flowerType;
    
    droppedFlower.appendChild(img);
    droppedFlowersContainer.appendChild(droppedFlower);
    
    // Mark original as used
    const originalFlower = document.querySelector(`[data-flower="${flowerType}"]`);
    if (originalFlower) {
      originalFlower.classList.add('used');
    }
    
    // Check if all flowers are collected
    if (droppedFlowers.size === totalFlowers) {
      completeBouquet();
    } else {
      updateDropText();
    }
  }
});

function updateDropText() {
  const remaining = totalFlowers - droppedFlowers.size;
  dropText.textContent = `${remaining} more flower${remaining > 1 ? 's' : ''} to go!`;
}

function completeBouquet() {
  // Hide individual flowers and drop text
  droppedFlowersContainer.style.display = 'none';
  dropText.style.display = 'none';
  
  // Show final bouquet
  finalBouquet.style.display = 'block';
  
  // Change drop zone styling
  dropZone.style.borderStyle = 'solid';
  dropZone.style.borderColor = '#511f29';
  dropZone.style.background = 'hsl(0, 0%, 7%)';
  
  // Add completion message
  // setTimeout(() => {
  //   const message = document.createElement('p');
  //   message.textContent = 'Iloveyou! ❤️';
  //   message.style.cssText = `
  //     font-family: "Just Me Again Down Here", cursive;
  //     font-size: 42px;
  //     color: #ff1744;
  //     text-align: center;
  //     margin-top: 20px;
  //     animation: flowerDrop 0.8s ease-out;
  //   `;
  //   dropZone.parentElement.appendChild(message);
  // }, 1000);
}