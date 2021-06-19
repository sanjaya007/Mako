const inputFile = document.querySelector(".cal_input_input");
const calFileWrapper = document.querySelector(".cal_files");
const totalSumBox = document.querySelector(".total-sum");
const totalSumSpan = document.querySelector(".total-sum-span");
const loadingWrapper = document.querySelector(".loader");
const calFiles = document.querySelector(".cal_files");
let divCounter = 0;

const uploadFile = (e) => {
  const files = e.target.files;
  const filesLength = files.length;

  for (i = 0; i < filesLength; i++) {
    const extName = files[i].name.split(".").pop().toLowerCase();
    if (extName === "dxf") {
      const node = createElementFromHTML(createCalFile(divCounter));
      calFileWrapper.appendChild(node);
      // calFileWrapper.innerHTML += createCalFile(divCounter);
      fetchSVG(files[i], divCounter);
      fetchMaterials(divCounter);
      divCounter++;
      if (i === filesLength - 1) {
        inputFile.value = "";
      }
    }
  }
  quantityCounter();
  addToCart();
  deleteBox();
  serviceCharge();
};

const CurrentBody = {
  filename: "",
  material: "",
  thickness: "",
};

const CurrentData = {
  materialEl: "",
  thicknessEl: "",
  delayEl: "",
  costToCut: "",
  costToMaterial: "",
  quantityValue: "",
  costqte: "",
  quantityCal: 0,
};

const ServiceData = {
  id: "39704774901916",
  quantity: "1",
  properties: {
    service: "active",
  },
};

const CartData = {
  items: [
    {
      id: "",
      quantity: "",
      image: "",
      properties: {
        ref: "",
        refid: "",
        dxf: "",
        total_surface: "",
        quantity: "",
      },
    },
    {
      id: "",
      quantity: "",
      image: "",
      properties: {
        ref: "",
        refid: "",
        dxf: "",
        total_time_to_cut: "",
        quantity: "",
      },
    },
    {
      id: "39704774901916",
      quantity: "1",
      properties: {
        service: "active",
      },
    },
  ],
};

const createCalFile = (counter) => {
  return (
    '<div id="box-' +
    counter +
    '" data-id="' +
    counter +
    '" class="cal_file">' +
    '<div class="dxf-filename">' +
    '<a href="#" target="_blank">' +
    "<p> <span> Loading... </span></p>" +
    "</a>" +
    "</div>" +
    '<div class="cal_file_preview">' +
    '<div class="cal_file_preview_image">' +
    "<img " +
    'class="image-preview" ' +
    'src= "' +
    "https://i.imgur.com/tkvLDAH.gif" +
    '"' +
    'alt="preview"' +
    'id="preview-img"' +
    "/>" +
    '<div class="error-image hidden"> <span> Invalid File !! </span> </div>' +
    "</div>" +
    '<div class="cal_file_prop">' +
    "<div>" +
    '<span class="cal_file_prop_key">Poids: </span>' +
    '<span class="cal-mass">Chargement...</span>' +
    "</div>" +
    "<div>" +
    '<span class="cal_file_prop_key">Taille Piece: </span>' +
    '<span class="cal-part-size">Chargement...</span>' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="cal_file_options">' +
    '<select name="material" class="select-material" id="material">' +
    '<option value="material">Matiere</option>' +
    "</select>" +
    '<select name="thickness" class="select-thickness disabled" id="thickness" disabled="disabled">' +
    '<option value="thickness">Epaisseur</option>' +
    "</select>" +
    '<select name="delay" class="select-delay disabled" id="delay" disabled="disabled">' +
    '<option value="delay">Standard</option>' +
    "</select>" +
    "</div>" +
    '<div class="cal_file_quantity">' +
    '<div class="cal_file_quantity_title">' +
    "<p>Quantite</p>" +
    "</div>" +
    '<div class="cal_file_quantity_counter">' +
    '<div class="quantity-box">' +
    '<input class="quantity-value" value="1"/>' +
    "</div>" +
    '<div class="quantity-btns">' +
    '<span class="decrease-quantity-btn">-</span>' +
    '<span class="increase-quantity-btn">+</span>' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="cal_file_cost">' +
    '<div class="cal_file_cost_ind">' +
    "<div>" +
    "<span>cout couper</span>" +
    '<p class="cost-to-cut">Chargement...</p>' +
    "</div>" +
    "<div>" +
    "<span>temps de découpe</span>" +
    '<p class="cost-to-cut-time"> Chargement... </p>' +
    "</div>" +
    "<div>" +
    "<span>cout matiere</span>" +
    '<p class="cost-to-material">Chargement...</p>' +
    "</div>" +
    "</div>" +
    '<div class="cal_file_cost_total">' +
    "<span>Total</span>" +
    '<p class="cost-qte">---</p>' +
    "</div>" +
    "</div>" +
    '<div class="add-box disabled">' +
    '<a href="#" class="add-to-cart"> Ajouter au panier </a>' +
    "</div>" +
    '<a href="#" class="delete-box"> ✕ </a>' +
    "</div>"
  );
};

if (inputFile) {
  inputFile.addEventListener("change", uploadFile);
}

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

const fetchSVG = async (val, counter) => {
  const formData = new FormData();
  formData.append("dxf", val);
  try {
    const URL = "https://app.mako.systems/dxf";
    const config = {
      method: "POST",
      body: formData,
    };
    const response = await fetch(URL, config);
    const data = await response.json();

    const dxfData = await data.filename;
    const pngData = await data.png;
    const svgData = await data.svg;

    document
      .querySelector(`#box-${counter} .image-preview`)
      .setAttribute("dxf", dxfData);
    document
      .querySelector(`#box-${counter} .image-preview`)
      .setAttribute("png", pngData);
    document
      .querySelector(`#box-${counter} .image-preview`)
      .setAttribute("src", svgData);
    document.querySelector(
      `#box-${counter} .dxf-filename span`
    ).innerText = dxfData;
    document.querySelector(`#box-${counter} .dxf-filename a`).href = svgData;
  } catch (error) {
    console.log(error);
  }
};

let cuttingData = [];

const fetchCutting = async () => {
  try {
    const URL = "https://app.mako.systems/shopify/cutting";
    const response = await fetch(URL);
    const data = await response.json();
    cuttingData = data;
  } catch (error) {
    console.log(error);
  }
};

fetchCutting();

const fetchMaterials = async (counter) => {
  try {
    const URL = "https://app.mako.systems/shopify/materials";

    const response = await fetch(URL);
    const data = await response.json();

    data.map((val, index) => {
      const opt = document.createElement("option");
      opt.setAttribute("value", `${val.title}`);
      opt.setAttribute("materialid", `${val.id}`);
      opt.setAttribute("cutting", `${val.product_type}`);
      if (val.product_type === "Plasma") {
        opt.setAttribute("cutting_id", "6649443352732");
      } else if (val.product_type === "Laser") {
        opt.setAttribute("cutting_id", "6649413828764");
      }
      opt.innerText = val.title;
      document
        .querySelector(`#box-${counter} .select-material`)
        .appendChild(opt);
    });

    document.querySelectorAll(`.select-material`).forEach((input) => {
      input.addEventListener("change", function (e) {
        const optValue = e.target.value;
        const materialID = this.options[this.selectedIndex].getAttribute(
          "materialid"
        );
        const cuttingID = this.options[this.selectedIndex].getAttribute(
          "cutting_id"
        );

        const parentBox = e.target.parentElement.parentElement.id;
        const thicknessInput = document.querySelector(
          `#${parentBox} .select-thickness`
        );
        const delayInput = document.querySelector(
          `#${parentBox} .select-delay`
        );

        if (optValue !== "material") {
          CurrentData.material = optValue.toLowerCase();
          thicknessInput.classList.remove("disabled");
          thicknessInput.removeAttribute("disabled");
          fetchDelay(cuttingID, delayInput);
          fetchThickness(materialID, thicknessInput);
        } else {
          thicknessInput.classList.add("disabled");
          thicknessInput.setAttribute("disabled", "disabled");
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const fetchThickness = async (id, input) => {
  try {
    const URL = `https://app.mako.systems/shopify/thickness/${id}`;
    const response = await fetch(URL);
    const data = await response.json();

    input.innerHTML = '<option value="thickness">Epaisseur</option>';

    data.map((val, index) => {
      const opt = document.createElement("option");
      opt.setAttribute("value", `${val.title}`);
      opt.setAttribute("price", `${val.price}`);
      opt.setAttribute("id", `${val.id}`);
      opt.innerText = val.title;
      input.appendChild(opt);
    });

    input.addEventListener("change", function (e) {
      const optValue = e.target.value;

      if (optValue !== "thickness") {
        CurrentBody.filename = document
          .querySelector(
            `#${input.parentElement.parentElement.id} .image-preview`
          )
          .getAttribute("dxf");

        CurrentBody.material = document
          .querySelector(
            `#${input.parentElement.parentElement.id} .select-material`
          )
          .value.toLowerCase();

        CurrentBody.thickness = optValue;

        loadingWrapper.classList.remove("hidden");
        calculateData(e.target);
        document
          .querySelector(
            `#${input.parentElement.parentElement.id} .select-delay`
          )
          .classList.remove("disabled");
        document
          .querySelector(
            `#${input.parentElement.parentElement.id} .select-delay`
          )
          .removeAttribute("disabled");
      } else {
        document
          .querySelector(
            `#${input.parentElement.parentElement.id} .select-delay`
          )
          .classList.add("disabled");
        document
          .querySelector(
            `#${input.parentElement.parentElement.id} .select-delay`
          )
          .setAttribute("disabled", "disabled");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const fetchDelay = async (id, input) => {
  try {
    const URL = `https://app.mako.systems/shopify/cutting/${id}`;
    const response = await fetch(URL);
    const data = await response.json();

    input.innerHTML = "";

    data.map((val, index) => {
      const opt = document.createElement("option");
      opt.setAttribute("value", `${val.title}`);
      opt.setAttribute("price", `${val.price}`);
      opt.setAttribute("id", `${val.id}`);
      opt.innerText = val.title;
      input.appendChild(opt);
    });

    input.addEventListener("change", function (e) {
      CurrentBody.filename = document
        .querySelector(
          `#${input.parentElement.parentElement.id} .image-preview`
        )
        .getAttribute("dxf");

      CurrentBody.material = document
        .querySelector(
          `#${input.parentElement.parentElement.id} .select-material`
        )
        .value.toLowerCase();

      CurrentBody.thickness = document.querySelector(
        `#${input.parentElement.parentElement.id} .select-thickness`
      ).value;

      loadingWrapper.classList.remove("hidden");
      calculateData(e.target);
    });
  } catch (error) {
    console.log(error);
  }
};

const quantityCounter = () => {
  const counterSpan = document.querySelectorAll(".quantity-btns span");
  const quantityInput = document.querySelectorAll(".quantity-value");

  quantityInput.forEach((el) => {
    el.addEventListener("input", quantityUpdate);
  });

  counterSpan.forEach((btn) => {
    btn.addEventListener("click", quantityOnClick);
  });
};

const quantityOnClick = (e) => {
  const parentBox =
    e.target.parentElement.parentElement.parentElement.parentElement.id;
  const materialEl = document.querySelector(`#${parentBox} .select-material`);
  const thicknessEl = document.querySelector(`#${parentBox} .select-thickness`);
  const delayEl = document.querySelector(`#${parentBox} .select-delay`);
  let quantityValue = document.querySelector(`#${parentBox} .quantity-value`);
  let spanClass = e.target.className;

  if (spanClass === "decrease-quantity-btn") {
    quantityValue.value = parseInt(quantityValue.value) - 1;
  } else if (spanClass === "increase-quantity-btn") {
    quantityValue.value = parseInt(quantityValue.value) + 1;
  } else {
    quantityValue.value = 1;
  }

  if (quantityValue.value < 1) {
    quantityValue.value = 1;
  }

  const costToCut = document.querySelector(`#${parentBox} .cost-to-cut`);
  const costToCutTime = document.querySelector(
    `#${parentBox} .cost-to-cut-time`
  );
  const costToMaterial = document.querySelector(
    `#${parentBox} .cost-to-material`
  );
  const costqte = document.querySelector(`#${parentBox} .cost-qte`);
  updateCurrent(
    materialEl,
    thicknessEl,
    delayEl,
    costToCut,
    costToCutTime,
    costToMaterial,
    quantityValue,
    costqte
  );
  quantityUpdate();
};

const calculateData = async (el) => {
  try {
    const URL = "https://app.mako.systems/calculate";
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(CurrentBody),
    };
    const parentBox = el.parentElement.parentElement.id;
    const imageContainer = document.querySelector(
      `#${parentBox} .image-preview`
    );
    const materialEl = document.querySelector(`#${parentBox} .select-material`);
    const thicknessEl = document.querySelector(
      `#${parentBox} .select-thickness`
    );
    const delayEl = document.querySelector(`#${parentBox} .select-delay`);

    const costToCut = document.querySelector(`#${parentBox} .cost-to-cut`);
    const costToCutTime = document.querySelector(
      `#${parentBox} .cost-to-cut-time`
    );
    const costToMaterial = document.querySelector(
      `#${parentBox} .cost-to-material`
    );
    const costqte = document.querySelector(`#${parentBox} .cost-qte`);
    const quantityValue = document.querySelector(
      `#${parentBox} .quantity-value`
    );
    const calMass = document.querySelector(`#${parentBox} .cal-mass`);
    const calPartSize = document.querySelector(`#${parentBox} .cal-part-size`);

    // const errorImg = document.querySelector(`#${parentBox} .error-image`);
    const addBtn = document.querySelector(`#${parentBox} .add-box`);
    const addBtnText = document.querySelector(`#${parentBox} .add-box a`);
    const calFile1 = document.querySelector(`#${parentBox} .cal_file_options`);
    const calFile2 = document.querySelector(`#${parentBox} .cal_file_quantity`);
    const calFile3 = document.querySelector(`#${parentBox} .cal_file_cost`);

    const response = await fetch(URL, config);
    const data = await response.json();

    if (data.message) {
      // errorImg.classList.remove("hidden");
      imageContainer.src =
        "https://cdn.shopify.com/s/files/1/0428/1342/3772/files/error.png?v=1619093315";
      addBtn.classList.add("disabled");
      calFile1.style.opacity = 0.5;
      calFile1.style.pointerEvents = "none";
      calFile2.style.opacity = 0.5;
      calFile2.style.pointerEvents = "none";
      calFile3.style.opacity = 0.5;
      calFile3.style.pointerEvents = "none";
    } else {
      addBtn.classList.remove("disabled");
      addBtnText.innerText = "Ajouter au panier";
    }

    loadingWrapper.classList.add("hidden");

    costToCut.setAttribute("time", data.total_time);
    costToCut.setAttribute("unittime", data.total_time);

    costToCut.setAttribute(
      "cutting_quantity",
      calculate_cutting_quantity(
        quantityValue.value,
        costToCut.getAttribute("unittime")
      )
    );
    costToCut.innerText =
      finalCostToCut(
        quantityValue.value,
        costToCut.getAttribute("unittime"),
        delayEl.options[delayEl.selectedIndex].getAttribute("price")
      ) + " €";
    costToCutTime.innerText = hmsFormat(
      Math.ceil(parseFloat(costToCut.getAttribute("time")))
    );

    costToMaterial.setAttribute("surface", data.surface);
    costToMaterial.setAttribute("total_surface", data.surface);
    costToMaterial.setAttribute(
      "material_quantity",
      calculate_material_quantity(
        costToMaterial.getAttribute("surface"),
        quantityValue.value
      )
    );
    costToMaterial.innerText =
      finalMaterialCost(
        quantityValue.value,
        costToMaterial.getAttribute("surface"),
        thicknessEl.options[thicknessEl.selectedIndex].getAttribute("price")
      ) + " €";

    calMass.innerText = data.mass.toFixed(3) + " kg";
    calPartSize.innerText = `(${data.part_x.toFixed(2)}, ${data.part_y.toFixed(
      2
    )}) meters`;

    updateCurrent(
      materialEl,
      thicknessEl,
      delayEl,
      costToCut,
      costToCutTime,
      costToMaterial,
      quantityValue,
      costqte
    );
    quantityUpdate();
  } catch (error) {
    console.log(error);
  }
};

const updateCurrent = (
  materialEl,
  thicknessEl,
  delayEl,
  costToCut,
  costToCutTime,
  costToMaterial,
  quantityValue,
  costqte
) => {
  CurrentData.materialEl = materialEl;
  CurrentData.thicknessEl = thicknessEl;
  CurrentData.delayEl = delayEl;
  CurrentData.costToCut = costToCut;
  CurrentData.costToCutTime = costToCutTime;
  CurrentData.costToMaterial = costToMaterial;
  CurrentData.quantityValue = quantityValue;
  CurrentData.costqte = costqte;
};

const quantityUpdate = () => {
  CurrentData.costToCut.setAttribute(
    "time",
    CurrentData.costToCut.getAttribute("unittime") *
      CurrentData.quantityValue.value
  );
  CurrentData.costToCut.setAttribute(
    "cutting_quantity",
    calculate_cutting_quantity(
      CurrentData.quantityValue.value,
      CurrentData.costToCut.getAttribute("unittime")
    )
  );
  CurrentData.costToCut.innerText =
    finalCostToCut(
      CurrentData.quantityValue.value,
      CurrentData.costToCut.getAttribute("unittime"),
      CurrentData.delayEl.options[
        CurrentData.delayEl.selectedIndex
      ].getAttribute("price")
    ) + " €";
  CurrentData.costToCutTime.innerText = hmsFormat(
    Math.ceil(parseFloat(CurrentData.costToCut.getAttribute("time")))
  );

  CurrentData.costToMaterial.setAttribute(
    "total_surface",
    CurrentData.costToMaterial.getAttribute("surface") *
      CurrentData.quantityValue.value
  );
  CurrentData.costToMaterial.setAttribute(
    "material_quantity",
    calculate_material_quantity(
      CurrentData.costToMaterial.getAttribute("surface"),
      CurrentData.quantityValue.value
    )
  );
  CurrentData.costToMaterial.innerText =
    finalMaterialCost(
      CurrentData.quantityValue.value,
      CurrentData.costToMaterial.getAttribute("surface"),
      CurrentData.thicknessEl.options[
        CurrentData.thicknessEl.selectedIndex
      ].getAttribute("price")
    ) + " €";

  let quantityCal =
    parseFloat(CurrentData.costToCut.innerText) +
    parseFloat(CurrentData.costToMaterial.innerText);
  quantityCal = quantityCal.toFixed(2);
  CurrentData.quantityCal = quantityCal;
  CurrentData.costqte.innerText = quantityCal + " €";
};

const finalCostToCut = (quantity, total_time, machine_cost) => {
  const total_cutting_time_per_job = Math.round(total_time * quantity);
  const shopify_machine_sales_units = Math.ceil(
    total_cutting_time_per_job / 60
  );
  return (shopify_machine_sales_units * machine_cost).toFixed(2);
};

const timeConverter = (seconds) => {
  const hms = secondsToHms(seconds);
  const hmsArr = hms.split(":");
  let hour = parseInt(hmsArr[0]);
  let min = parseInt(hmsArr[1]);
  let sec = parseInt(hmsArr[2]);

  if (hour > 0 && min > 0 && sec > 0) {
    min = min + 1;
    return hour + "h " + min + "m";
  } else if (hour === 0 && min === 0 && sec > 0) {
    min = min + 1;
    return sec + "s";
  } else if (hour === 0 && min > 0 && sec > 0) {
    min = min + 1;
    return min + "m";
  } else if (hour === 0 && min > 0 && sec === 0) {
    return min + "m";
  } else if (hour > 0 && min === 0 && sec === 0) {
    return hour + "h";
  } else if (hour > 0 && min === 0 && sec > 0) {
    min = min + 1;
    return hour + "h " + min + "m";
  }
};

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  return h + ":" + m + ":" + s;
}

function hmsFormat(value) {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (hours === "00") {
    hours = "HH";
  }
  if (minutes === "00") {
    minutes = "MM";
  }
  if (seconds === "00") {
    seconds = "SS";
  }
  if (minutes != "MM" && seconds === "SS") {
    seconds = "00";
  }
  if (minutes != "HH" && seconds === "SS" && minutes === "MM") {
    minutes = "00";
    seconds = "00";
  }
  console.log(hours, minutes, seconds);
  return hours + ":" + minutes + ":" + seconds; // Return is HH : MM : SS
}

const finalMaterialCost = (quantity, surface, price) => {
  const shopify_material_units = Math.ceil(surface * quantity);
  return (shopify_material_units * price).toFixed(2);
};

function calculate_material_quantity(surface, quantity) {
  const shopify_material_units = Math.ceil(surface * quantity);
  return shopify_material_units;
}

function calculate_cutting_quantity(quantity, total_time) {
  const total_cutting_time_per_job = Math.round(total_time * quantity);
  const shopify_machine_sales_units = Math.ceil(
    total_cutting_time_per_job / 60
  );

  return shopify_machine_sales_units;
}

const addToCart = () => {
  const cartBtns = document.querySelectorAll(".add-to-cart");

  cartBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const parentEl = e.target.parentElement.parentElement.id;

      const dxfFile = document
        .querySelector(`#${parentEl} .image-preview`)
        .getAttribute("dxf");
      const pngFile = document
        .querySelector(`#${parentEl} .image-preview`)
        .getAttribute("png");
      const thicknessEl = document.querySelector(
        `#${parentEl} .select-thickness`
      );
      const delayEl = document.querySelector(`#${parentEl} .select-delay`);

      const quantityValue = document.querySelector(
        `#${parentEl} .quantity-value`
      ).value;

      const thicknessID = thicknessEl.options[
        thicknessEl.selectedIndex
      ].getAttribute("id");
      const delayID = delayEl.options[delayEl.selectedIndex].getAttribute("id");

      const materialQuantity = document
        .querySelector(`#${parentEl} .cost-to-material`)
        .getAttribute("material_quantity");
      const materialSurface = document
        .querySelector(`#${parentEl} .cost-to-material`)
        .getAttribute("total_surface");

      const cuttingQuantity = document
        .querySelector(`#${parentEl} .cost-to-cut`)
        .getAttribute("cutting_quantity");
      const cuttingTime = document.querySelector(
        `#${parentEl} .cost-to-cut-time`
      ).innerText;

      const randomNumber = randomHash();

      CartData.items[0].id = thicknessID;
      CartData.items[0].properties.ref = randomNumber;
      CartData.items[0].properties.refid = randomNumber;
      CartData.items[0].quantity = materialQuantity;
      CartData.items[0].image = pngFile;
      CartData.items[0].properties.dxf = dxfFile;
      CartData.items[0].properties.total_surface = materialSurface;
      CartData.items[0].properties.quantity =
        quantityValue + checkQuantity(quantityValue);

      CartData.items[1].id = delayID;
      CartData.items[1].properties.ref = randomNumber;
      CartData.items[1].properties.refid = randomNumber;
      CartData.items[1].quantity = cuttingQuantity;
      CartData.items[1].image = pngFile;
      CartData.items[1].properties.dxf = dxfFile;
      CartData.items[1].properties.total_time_to_cut = cuttingTime;
      CartData.items[1].properties.quantity =
        quantityValue + checkQuantity(quantityValue);

      getLatestCart(e);
    });
  });
};

const randomHash = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const checkQuantity = (val) => {
  const intVal = parseInt(val);
  if (intVal === 1) {
    return " part";
  } else {
    return " parts";
  }
};

const getLatestCart = async (el) => {
  const URL = "/cart.js";
  try {
    const response = await fetch(URL);
    const data = await response.json();

    const items = await data.items;
    let hasServiceInCart = false;
    for (const key in items) {
      const itemProperty = items[key].properties;
      if (itemProperty && itemProperty.service) {
        hasServiceInCart = true;
      }
    }
    if (hasServiceInCart) CartData.items.length = 2;
    else {
      CartData.items[2] = ServiceData;
    }
    fetchCart(el);
  } catch (error) {
    console.log(error);
  }
};

const clearCart = async () => {
  const URL = "/cart/clear.js";
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  };
  try {
    const response = await fetch(URL, config);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

const fetchCart = async (el) => {
  console.log(CartData);
  try {
    const URL = "/cart/add.js";
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(CartData),
    };

    const response = await fetch(URL, config);
    const data = await response.json();

    if (data.message) {
      alert("Not enough quantity of metal !!");
    } else {
      const cartLink = document.querySelector(".cal .cart-link");

      const btnEl = el.target;
      btnEl.innerText = "Ajoute";
      btnEl.parentElement.classList.add("disabled");

      cartLink.classList.remove("disabled");
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteBox = () => {
  const deleteBtns = document.querySelectorAll(".delete-box");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const parentBox = e.target.parentElement;
      parentBox.remove();
      serviceCharge();
    });
  });
};

const serviceCharge = () => {
  const serviceBox = document.querySelector(".service-box");

  const childrenLength = calFiles.children.length;
  if (childrenLength > 1) {
    serviceBox.classList.remove("hidden");
  } else {
    serviceBox.classList.add("hidden");
  }
};

const removeBtns = document.querySelectorAll(".cart__product-meta a");
const refElements = document.querySelectorAll(
  ".product-details__item--property"
);
const cartTable = document.querySelector(".cart");
const refKey = "ref: ";
const refIdKey = "refid: ";
const serviceKey = "service: ";

refElements.forEach((ref) => {
  const val = ref.children[0].innerText;
  if (refKey === val || serviceKey === val) {
    ref.style.display = "none";
  }
  if (refIdKey === val || serviceKey === val) {
    ref.style.display = "none";
  }
  if (serviceKey === val) {
    ref.parentElement.parentElement.querySelector(
      ".cart__product-meta a"
    ).style.display = "none";
  }
});

let removeUrls = [];
let finalUrls = [];
removeBtns.forEach((el) => {
  el.innerText = "Remove";
  //   el.style.color = "red";
  el.addEventListener("click", function (e) {
    cartTable.style.pointerEvents = "none";
    cartTable.style.opacity = "0.5";

    const childrenLength = e.target.parentElement.parentElement.children.length;
    console.log(childrenLength);

    if (childrenLength >= 8) {
      e.preventDefault();

      const refValue =
        e.target.parentElement.parentElement.children[3].children[1].innerText;

      console.log(refValue);
      const list = document.querySelectorAll(
        ".product-details__item--property"
      );

      removeUrls = [];
      finalUrls = [];
      list.forEach((el) => {
        const match = el.children[1].innerText;
        if (refValue === match) {
          const matchedBtn = el.parentElement.querySelector(
            ".cart__product-meta a"
          );
          console.log(matchedBtn);
          const line = matchedBtn.href.split("=")[1].split("")[0];
          removeUrls.push(line);
        }
      });

      removeUrls.sort();
      removeUrls.reverse();
      const uniqueArray = [...new Set(removeUrls)];
      uniqueArray.forEach((val) => {
        finalUrls.push(val);
      });

      callAjax(finalUrls[0]);
    }
  });
});

const callAjax = (line) => {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4) {
      fetch("/cart/change?line=" + finalUrls[1] + "&quantity=0").then(
        reloadPage
      );
    }
  };
  req.open("GET", "/cart/change?line=" + line + "&quantity=0", true);
  req.send();
};

// let remainingDxf = [];

// const checkDxf = (data) => {
//   console.log(data);
//   if(data.status === 200){
//     remainingDxf = [];
//     refElements.forEach((el) => {
//       	const val = el.children[0].innerText;
//   		if (refKey === val) {
//     		remainingDxf.push(el);
//   		}
//     })
//   }
// //   window.location.reload();
// };

const reloadPage = (data) => {
  window.location.reload();
};

window.onload = () => {
  checkDxf();
};

const checkDxf = async () => {
  const URL = "/cart.js";
  try {
    const response = await fetch(URL);
    const data = await response.json();

    const items = await data.items;
    let hasDxfInCart = false;
    for (const key in items) {
      const itemProperty = items[key].properties;
      if (itemProperty && itemProperty.ref) {
        hasDxfInCart = true;
      }
    }
    if (!hasDxfInCart) removeServiceCharge();
  } catch (error) {
    console.log(error);
    ``;
  }
};

const removeServiceCharge = () => {
  refElements.forEach((el) => {
    const val = el.children[0].innerText;
    if (val.indexOf("service") >= 0) {
      el.parentElement.parentElement
        .querySelector(".cart__product-meta a")
        .click();
      //       window.location.href = serviceBtnHref;
    }
  });
};
