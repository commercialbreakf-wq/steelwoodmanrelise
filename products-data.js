const PRODUCTS = [
  {
    "id": "docx-0",
    "category": "Арматура",
    "name": "Арматура А 1 6",
    "priceTonNum": 62575.27,
    "priceUnit": "211,34",
    "img": "/images/products/round_steel_premium_1778423868660.png",
    "length": "Мерная"
  },
  {
    "id": "docx-1",
    "category": "Арматура",
    "name": "Арматура А 3 8",
    "priceTonNum": 59952.48,
    "priceUnit": "23,68",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-2",
    "category": "Арматура",
    "name": "Арматура А 3 10",
    "priceTonNum": 58335.99,
    "priceUnit": "36,00",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-3",
    "category": "Арматура",
    "name": "Арматура А 3 12",
    "priceTonNum": 62012.71,
    "priceUnit": "55,07",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-4",
    "category": "Арматура",
    "name": "Арматура А 3 14",
    "priceTonNum": 58097.14,
    "priceUnit": "70,30",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-5",
    "category": "Арматура",
    "name": "Арматура А 3 16",
    "priceTonNum": 62035.27,
    "priceUnit": "98,02",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-6",
    "category": "Арматура",
    "name": "Арматура А 3 18",
    "priceTonNum": 59352.76,
    "priceUnit": "118,71",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-7",
    "category": "Арматура",
    "name": "Арматура А 3 20",
    "priceTonNum": 59433.58,
    "priceUnit": "146,80",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-8",
    "category": "Арматура",
    "name": "Арматура А 3 22",
    "priceTonNum": 60416.86,
    "priceUnit": "180,28",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-9",
    "category": "Арматура",
    "name": "Арматура А 3 25",
    "priceTonNum": 59746.15,
    "priceUnit": "230,20",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-10",
    "category": "Арматура",
    "name": "Арматура А 3 28",
    "priceTonNum": 59352.76,
    "priceUnit": "286,85",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-11",
    "category": "Арматура",
    "name": "Арматура А 3 32",
    "priceTonNum": 62035.27,
    "priceUnit": "391,63",
    "img": "/images/rebar.png",
    "length": "Мерная"
  },
  {
    "id": "docx-20",
    "category": "Балка",
    "name": "Балка 10Б 1",
    "priceTonNum": 59014.04,
    "priceUnit": "196,67",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-21",
    "category": "Балка",
    "name": "Балка 12Б 1",
    "priceTonNum": 59938.59,
    "priceUnit": "204,93",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-22",
    "category": "Балка",
    "name": "Балка 12Б 2",
    "priceTonNum": 59092.46,
    "priceUnit": "213,23",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-23",
    "category": "Балка",
    "name": "Балка 14Б 1",
    "priceTonNum": 62717.7,
    "priceUnit": "207,35",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-24",
    "category": "Балка",
    "name": "Балка 14Б 2",
    "priceTonNum": 59869.19,
    "priceUnit": "214,58",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-25",
    "category": "Балка",
    "name": "Балка 16Б 1",
    "priceTonNum": 58799.18,
    "priceUnit": "218,23",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-26",
    "category": "Балка",
    "name": "Балка 18Б 1",
    "priceTonNum": 62521.21,
    "priceUnit": "184,7",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-27",
    "category": "Балка",
    "name": "Балка 18Б 2",
    "priceTonNum": 61197.35,
    "priceUnit": "193,67",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-28",
    "category": "Балка",
    "name": "Балка 20Б 1",
    "priceTonNum": 62540.84,
    "priceUnit": "195,02",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-29",
    "category": "Балка",
    "name": "Балка 20Б 2",
    "priceTonNum": 62509.11,
    "priceUnit": "191,59",
    "img": "/images/products/steel_beams_premium_1778423982429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-30",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 0.7",
    "priceTonNum": 58206.7,
    "priceUnit": "196,96",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-31",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 0.8",
    "priceTonNum": 61233.2,
    "priceUnit": "209,04",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-32",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 0.9",
    "priceTonNum": 60403.81,
    "priceUnit": "204,11",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-33",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 1",
    "priceTonNum": 58183.81,
    "priceUnit": "202,2",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-34",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 1.2",
    "priceTonNum": 58544.25,
    "priceUnit": "198,43",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-35",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 1.3",
    "priceTonNum": 59179.91,
    "priceUnit": "187,85",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-36",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 1.5",
    "priceTonNum": 60197.28,
    "priceUnit": "196,35",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-37",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 2",
    "priceTonNum": 58958.97,
    "priceUnit": "193,6",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-38",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 2.5",
    "priceTonNum": 60385.43,
    "priceUnit": "184,13",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-39",
    "category": "Лист холоднокатаный",
    "name": "Лист х/к 3",
    "priceTonNum": 59637.35,
    "priceUnit": "207,23",
    "img": "/images/products/cold_rolled_sheets_premium_1778423951350.png",
    "length": "Мерная"
  },
  {
    "id": "docx-40",
    "category": "Труба профильная",
    "name": "Труба профильная 25х 25х 2",
    "priceTonNum": 58048.55,
    "priceUnit": "184,27",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-41",
    "category": "Труба профильная",
    "name": "Труба профильная 20х 20х 2",
    "priceTonNum": 61159.1,
    "priceUnit": "180,97",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-42",
    "category": "Труба профильная",
    "name": "Труба профильная 30х 30х 2",
    "priceTonNum": 60893.36,
    "priceUnit": "212,39",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-43",
    "category": "Труба профильная",
    "name": "Труба профильная 40х 40х 1.5",
    "priceTonNum": 58062.14,
    "priceUnit": "200,35",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-44",
    "category": "Труба профильная",
    "name": "Труба профильная 40х 40х 2",
    "priceTonNum": 62298.81,
    "priceUnit": "194,8",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-45",
    "category": "Труба профильная",
    "name": "Труба профильная 40х 40х 3",
    "priceTonNum": 58369.63,
    "priceUnit": "211,86",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-46",
    "category": "Труба профильная",
    "name": "Труба профильная 50х 50х 2",
    "priceTonNum": 60190.59,
    "priceUnit": "210,06",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-47",
    "category": "Труба профильная",
    "name": "Труба профильная 50х 50х 3",
    "priceTonNum": 59894.52,
    "priceUnit": "215,68",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-48",
    "category": "Труба профильная",
    "name": "Труба профильная 60х 60х 2",
    "priceTonNum": 61895.4,
    "priceUnit": "204,31",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-49",
    "category": "Труба профильная",
    "name": "Труба профильная 60х 60х 3",
    "priceTonNum": 60397.28,
    "priceUnit": "205,39",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-50",
    "category": "Труба профильная",
    "name": "Труба профильная 60х 60х 4",
    "priceTonNum": 62634.23,
    "priceUnit": "189,95",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-51",
    "category": "Труба профильная",
    "name": "Труба профильная 70х 70х 2",
    "priceTonNum": 59543.92,
    "priceUnit": "218,71",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-52",
    "category": "Труба профильная",
    "name": "Труба профильная 70х 70х 3",
    "priceTonNum": 62083.01,
    "priceUnit": "201,85",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-53",
    "category": "Труба профильная",
    "name": "Труба профильная 80х 80х 2",
    "priceTonNum": 60748.7,
    "priceUnit": "201,13",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-54",
    "category": "Труба профильная",
    "name": "Труба профильная 80х 80х 3",
    "priceTonNum": 62548.86,
    "priceUnit": "208,07",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-55",
    "category": "Труба профильная",
    "name": "Труба профильная 80х 80х 4",
    "priceTonNum": 60981.14,
    "priceUnit": "182,8",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-56",
    "category": "Труба профильная",
    "name": "Труба профильная 100х 100х 3",
    "priceTonNum": 58517.04,
    "priceUnit": "187,2",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-57",
    "category": "Труба профильная",
    "name": "Труба профильная 100х 100х 4",
    "priceTonNum": 62358.85,
    "priceUnit": "187,52",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-58",
    "category": "Труба профильная",
    "name": "Труба профильная 100х 100х 5",
    "priceTonNum": 61128.29,
    "priceUnit": "193,69",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-59",
    "category": "Труба профильная",
    "name": "Труба профильная 120х 120х 4",
    "priceTonNum": 61158.26,
    "priceUnit": "219,74",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-60",
    "category": "Труба профильная",
    "name": "Труба профильная 120х 120х 5",
    "priceTonNum": 59829.52,
    "priceUnit": "181,97",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-61",
    "category": "Труба профильная",
    "name": "Труба профильная 150х 150х 5",
    "priceTonNum": 60757.83,
    "priceUnit": "182,36",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-62",
    "category": "Труба профильная",
    "name": "Труба профильная 150х 150х 7",
    "priceTonNum": 62086.68,
    "priceUnit": "194,03",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-63",
    "category": "Труба профильная",
    "name": "Труба профильная 150х 150х 8",
    "priceTonNum": 62341.94,
    "priceUnit": "197,3",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-64",
    "category": "Труба профильная",
    "name": "Труба профильная 150х 150х 10",
    "priceTonNum": 62221.85,
    "priceUnit": "214,08",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-65",
    "category": "Труба профильная",
    "name": "Труба профильная 200х 200х 5",
    "priceTonNum": 60324.29,
    "priceUnit": "192,39",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-66",
    "category": "Труба профильная",
    "name": "Труба профильная 200х 200х 8",
    "priceTonNum": 60513.01,
    "priceUnit": "210,26",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-67",
    "category": "Труба профильная",
    "name": "Труба профильная 200х 200х 10",
    "priceTonNum": 62092.78,
    "priceUnit": "210,67",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-68",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 40х 20х 1.5",
    "priceTonNum": 58791.45,
    "priceUnit": "198,44",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-69",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 40х 20х 2",
    "priceTonNum": 61024.18,
    "priceUnit": "184,25",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-70",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 40х 20х 3",
    "priceTonNum": 59419.07,
    "priceUnit": "184,53",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-71",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 50х 25х 1.5",
    "priceTonNum": 58482.44,
    "priceUnit": "215,78",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-72",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 50х 25х 3",
    "priceTonNum": 61612.77,
    "priceUnit": "203,13",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-73",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 60х 30х 2",
    "priceTonNum": 59382.51,
    "priceUnit": "217,77",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-74",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 60х 30х 3",
    "priceTonNum": 58086.62,
    "priceUnit": "188,61",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-75",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 80х 40х 2",
    "priceTonNum": 60267.06,
    "priceUnit": "219,71",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-76",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 80х 40х 3",
    "priceTonNum": 58987.37,
    "priceUnit": "212,5",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-77",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 80х 40х 4",
    "priceTonNum": 61910.6,
    "priceUnit": "205,3",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-78",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 100х 50х 2",
    "priceTonNum": 61621.12,
    "priceUnit": "209,28",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-79",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 100х 50х 3",
    "priceTonNum": 59568.11,
    "priceUnit": "208,09",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-80",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 100х 50х 4",
    "priceTonNum": 59247.45,
    "priceUnit": "213,97",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-81",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 100х 50х 5",
    "priceTonNum": 58572.2,
    "priceUnit": "181,72",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-82",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 100х 60х 3",
    "priceTonNum": 59971.98,
    "priceUnit": "192,85",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-83",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 120х 60х 4",
    "priceTonNum": 62670.67,
    "priceUnit": "218,17",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-84",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 120х 60х 5",
    "priceTonNum": 59163.76,
    "priceUnit": "180,73",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-85",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 200х 100х 5",
    "priceTonNum": 59674.61,
    "priceUnit": "185,83",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-86",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 200х 100х 6",
    "priceTonNum": 58838.01,
    "priceUnit": "203,61",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-87",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 200х 100х 8",
    "priceTonNum": 61895.47,
    "priceUnit": "186,02",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-88",
    "category": "Труба профильная",
    "name": "Труба профильная прямоугольная 200х 100х 10",
    "priceTonNum": 58442.1,
    "priceUnit": "192,21",
    "img": "/images/products/profile_tubes_premium_1778423900429.png",
    "length": "Мерная"
  },
  {
    "id": "docx-89",
    "category": "Труба электросварная",
    "name": "Труба электросварная 57х 3",
    "priceTonNum": 58388.81,
    "priceUnit": "208,26",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-181",
    "category": "Труба электросварная",
    "name": "Труба электросварная 76х 3",
    "priceTonNum": 62775.06,
    "priceUnit": "338,36",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-181b",
    "category": "Труба электросварная",
    "name": "Труба электросварная 76х 4",
    "priceTonNum": 62775.06,
    "priceUnit": "195,33",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-91-1",
    "category": "Труба электросварная",
    "name": "Труба электросварная 89х 3",
    "priceTonNum": 60931.49,
    "priceUnit": "210,65",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-91-2",
    "category": "Труба электросварная",
    "name": "Труба электросварная 89х 4",
    "priceTonNum": 60931.49,
    "priceUnit": "210,65",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-92-1",
    "category": "Труба электросварная",
    "name": "Труба электросварная 108х 3",
    "priceTonNum": 62912.61,
    "priceUnit": "214,23",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-92-2",
    "category": "Труба электросварная",
    "name": "Труба электросварная 108х 4",
    "priceTonNum": 62912.61,
    "priceUnit": "214,23",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-93-1",
    "category": "Труба электросварная",
    "name": "Труба электросварная 133х 4",
    "priceTonNum": 62285.1,
    "priceUnit": "213,69",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-93-2",
    "category": "Труба электросварная",
    "name": "Труба электросварная 133х 5",
    "priceTonNum": 62285.1,
    "priceUnit": "213,69",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-94-1",
    "category": "Труба электросварная",
    "name": "Труба электросварная 159х 4",
    "priceTonNum": 60020.79,
    "priceUnit": "192,47",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-94-2",
    "category": "Труба электросварная",
    "name": "Труба электросварная 159х 5",
    "priceTonNum": 60020.79,
    "priceUnit": "192,47",
    "img": "/images/tubes_esv.png",
    "length": "Мерная"
  },
  {
    "id": "docx-95",
    "category": "Уголок",
    "name": "Уголок 25х 3",
    "priceTonNum": 59689.59,
    "priceUnit": "200,88",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-96",
    "category": "Уголок",
    "name": "Уголок 32х 3",
    "priceTonNum": 59806.97,
    "priceUnit": "197,18",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-97",
    "category": "Уголок",
    "name": "Уголок 40х 3",
    "priceTonNum": 58576.4,
    "priceUnit": "205,01",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-98",
    "category": "Уголок",
    "name": "Уголок 40х 4",
    "priceTonNum": 58311.22,
    "priceUnit": "196,68",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-99",
    "category": "Уголок",
    "name": "Уголок 50х 3",
    "priceTonNum": 61558.18,
    "priceUnit": "206,7",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-100",
    "category": "Уголок",
    "name": "Уголок 50х 4",
    "priceTonNum": 62705.1,
    "priceUnit": "205,22",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-101",
    "category": "Уголок",
    "name": "Уголок 63х 4",
    "priceTonNum": 62206.19,
    "priceUnit": "192,21",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-102",
    "category": "Уголок",
    "name": "Уголок 63х 5",
    "priceTonNum": 62835.81,
    "priceUnit": "204,14",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-103",
    "category": "Уголок",
    "name": "Уголок 70х 5",
    "priceTonNum": 59931.95,
    "priceUnit": "209,44",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-104",
    "category": "Уголок",
    "name": "Уголок 70х 6",
    "priceTonNum": 59309.48,
    "priceUnit": "180,38",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-105",
    "category": "Уголок",
    "name": "Уголок 70х 7",
    "priceTonNum": 61200.33,
    "priceUnit": "182,17",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-106",
    "category": "Уголок",
    "name": "Уголок 90х 6",
    "priceTonNum": 59399.38,
    "priceUnit": "213,06",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-107",
    "category": "Уголок",
    "name": "Уголок 90х 7",
    "priceTonNum": 58876.58,
    "priceUnit": "196,04",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-108",
    "category": "Уголок",
    "name": "Уголок 90х 8",
    "priceTonNum": 58397.41,
    "priceUnit": "189,68",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-109",
    "category": "Уголок",
    "name": "Уголок 100х 7",
    "priceTonNum": 60541.39,
    "priceUnit": "208,77",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-110",
    "category": "Уголок",
    "name": "Уголок 100х 8",
    "priceTonNum": 60741.06,
    "priceUnit": "207,21",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-111",
    "category": "Уголок",
    "name": "Уголок 100х 9",
    "priceTonNum": 61287.99,
    "priceUnit": "215,03",
    "img": "/images/products/steel_angles_premium_1778423996872.png",
    "length": "Мерная"
  },
  {
    "id": "docx-112",
    "category": "Швеллер",
    "name": "Швеллер 8П",
    "priceTonNum": 59911.42,
    "priceUnit": "217,71",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-113",
    "category": "Швеллер",
    "name": "Швеллер 10П",
    "priceTonNum": 60229.4,
    "priceUnit": "181,3",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-114",
    "category": "Швеллер",
    "name": "Швеллер 12П",
    "priceTonNum": 62685.03,
    "priceUnit": "217,95",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-115",
    "category": "Швеллер",
    "name": "Швеллер 14П",
    "priceTonNum": 60343.87,
    "priceUnit": "208,58",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-116",
    "category": "Швеллер",
    "name": "Швеллер 16П",
    "priceTonNum": 60078.31,
    "priceUnit": "202,67",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-117",
    "category": "Швеллер",
    "name": "Швеллер 18П",
    "priceTonNum": 62516.78,
    "priceUnit": "210,69",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-118",
    "category": "Швеллер",
    "name": "Швеллер 20П",
    "priceTonNum": 58065.93,
    "priceUnit": "199,27",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-119",
    "category": "Швеллер",
    "name": "Швеллер 22П",
    "priceTonNum": 58821.72,
    "priceUnit": "209,54",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-120",
    "category": "Швеллер",
    "name": "Швеллер 24П",
    "priceTonNum": 59650.69,
    "priceUnit": "189,95",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-121",
    "category": "Швеллер",
    "name": "Швеллер 8У",
    "priceTonNum": 62828.51,
    "priceUnit": "185,52",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-122",
    "category": "Швеллер",
    "name": "Швеллер 10У",
    "priceTonNum": 59780.19,
    "priceUnit": "195,72",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-123",
    "category": "Швеллер",
    "name": "Швеллер 12У",
    "priceTonNum": 62798.35,
    "priceUnit": "196,58",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-124",
    "category": "Швеллер",
    "name": "Швеллер 14У",
    "priceTonNum": 62735.03,
    "priceUnit": "211,32",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-125",
    "category": "Швеллер",
    "name": "Швеллер 16У",
    "priceTonNum": 61937.73,
    "priceUnit": "186,54",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-126",
    "category": "Швеллер",
    "name": "Швеллер 18У",
    "priceTonNum": 58832,
    "priceUnit": "216,25",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-127",
    "category": "Швеллер",
    "name": "Швеллер 20У",
    "priceTonNum": 58709.13,
    "priceUnit": "216,73",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-128",
    "category": "Швеллер",
    "name": "Швеллер 22У",
    "priceTonNum": 62460.61,
    "priceUnit": "206,78",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-129",
    "category": "Швеллер",
    "name": "Швеллер 24У",
    "priceTonNum": 62841.76,
    "priceUnit": "191,44",
    "img": "/images/products/steel_channels_premium_1778424020131.png",
    "length": "Мерная"
  },
  {
    "id": "docx-130",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный С 8",
    "priceTonNum": 61411.38,
    "priceUnit": "219,18",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-131",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный С 10",
    "priceTonNum": 58270.97,
    "priceUnit": "217,58",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-132",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный С 20",
    "priceTonNum": 61137.68,
    "priceUnit": "195,54",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-133",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный С 21",
    "priceTonNum": 59808.68,
    "priceUnit": "190,24",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-134",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный НС 35",
    "priceTonNum": 58775.72,
    "priceUnit": "202,99",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-135",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный НС 44",
    "priceTonNum": 59117.76,
    "priceUnit": "206,85",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-136",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный Н 57",
    "priceTonNum": 61725.79,
    "priceUnit": "203,55",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-137",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный Н 60",
    "priceTonNum": 61581.13,
    "priceUnit": "192,51",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-138",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный Н 75",
    "priceTonNum": 62349.56,
    "priceUnit": "200,08",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-139",
    "category": "Профнастил окрашенный",
    "name": "Профнастил окрашенный Н 114",
    "priceTonNum": 59792.76,
    "priceUnit": "192,5",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-150",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм С 8",
    "priceTonNum": 61285.9,
    "priceUnit": "199,41",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-151",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм С 10",
    "priceTonNum": 59264.57,
    "priceUnit": "199,33",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-152",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм С 20",
    "priceTonNum": 59789.18,
    "priceUnit": "213,11",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-153",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм С 21",
    "priceTonNum": 61155.72,
    "priceUnit": "218,67",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-154",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм НС 35",
    "priceTonNum": 61334.32,
    "priceUnit": "180,55",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-155",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм НС 44",
    "priceTonNum": 60374.14,
    "priceUnit": "216,4",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-156",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм Н 57",
    "priceTonNum": 62763.08,
    "priceUnit": "191,67",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-157",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм Н 60",
    "priceTonNum": 58809.27,
    "priceUnit": "210,54",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-158",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм Н 75",
    "priceTonNum": 60491.55,
    "priceUnit": "191,37",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-159",
    "category": "Профнастил оцинкованный",
    "name": "Профнастил оцинкованный 0.4мм Н 114",
    "priceTonNum": 61635,
    "priceUnit": "215,1",
    "img": "/images/products/corrugated_sheets_premium.png",
    "length": "Мерная"
  },
  {
    "id": "docx-160",
    "category": "Сетка",
    "name": "Сетка 3 м",
    "priceTonNum": 59631.26,
    "priceUnit": "180,08",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-161",
    "category": "Сетка",
    "name": "Сетка 50х 50х 3",
    "priceTonNum": 60231.53,
    "priceUnit": "194,95",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-162",
    "category": "Сетка",
    "name": "Сетка 100х 100х 3",
    "priceTonNum": 62509.08,
    "priceUnit": "215,96",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-163",
    "category": "Сетка",
    "name": "Сетка 150х 150х 3",
    "priceTonNum": 62083.95,
    "priceUnit": "215,01",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-164",
    "category": "Сетка",
    "name": "Сетка 200х 200х 3",
    "priceTonNum": 62443.72,
    "priceUnit": "205,92",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-165",
    "category": "Сетка",
    "name": "Сетка 50х 50х 4",
    "priceTonNum": 62565.56,
    "priceUnit": "190,12",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-166",
    "category": "Сетка",
    "name": "Сетка 100х 100х 4",
    "priceTonNum": 62404.52,
    "priceUnit": "215,18",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-167",
    "category": "Сетка",
    "name": "Сетка 150х 150х 4",
    "priceTonNum": 61396.44,
    "priceUnit": "219,48",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-168",
    "category": "Сетка",
    "name": "Сетка 200х 200х 4",
    "priceTonNum": 59502.08,
    "priceUnit": "185,05",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-169",
    "category": "Сетка",
    "name": "Сетка 50х 50х 5",
    "priceTonNum": 62450.95,
    "priceUnit": "193,12",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-170",
    "category": "Сетка",
    "name": "Сетка 100х 100х 5",
    "priceTonNum": 59378.34,
    "priceUnit": "186,72",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-171",
    "category": "Сетка",
    "name": "Сетка 150х 150х 5",
    "priceTonNum": 59916.85,
    "priceUnit": "199,48",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-172",
    "category": "Сетка",
    "name": "Сетка 200х 200х 5",
    "priceTonNum": 59289.44,
    "priceUnit": "215,48",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-173",
    "category": "Сетка",
    "name": "Сетка 50х 50х 8",
    "priceTonNum": 62782.58,
    "priceUnit": "182,46",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-174",
    "category": "Сетка",
    "name": "Сетка 100х 100х 8",
    "priceTonNum": 61062.35,
    "priceUnit": "207,37",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-175",
    "category": "Сетка",
    "name": "Сетка 150х 150х 8",
    "priceTonNum": 58395.42,
    "priceUnit": "188,62",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-176",
    "category": "Сетка",
    "name": "Сетка 200х 200х 8",
    "priceTonNum": 58759.7,
    "priceUnit": "184,82",
    "img": "/images/products/steel_mesh_premium_1778423969480.png",
    "length": "Мерная"
  },
  {
    "id": "docx-177",
    "category": "Труба ВГП",
    "name": "Труба ВГП 15х 2.5",
    "priceTonNum": 59515.74,
    "priceUnit": "213,29",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-178",
    "category": "Труба ВГП",
    "name": "Труба ВГП 15х 2.8",
    "priceTonNum": 59375.81,
    "priceUnit": "187,11",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-179",
    "category": "Труба ВГП",
    "name": "Труба ВГП 20х 2.5",
    "priceTonNum": 62507.92,
    "priceUnit": "203,78",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-180",
    "category": "Труба ВГП",
    "name": "Труба ВГП 20х 2.8",
    "priceTonNum": 60158.32,
    "priceUnit": "194,49",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-181",
    "category": "Труба ВГП",
    "name": "Труба ВГП 25х 2.5",
    "priceTonNum": 60312.83,
    "priceUnit": "195,66",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-182",
    "category": "Труба ВГП",
    "name": "Труба ВГП 25х 2.8",
    "priceTonNum": 58272.21,
    "priceUnit": "208,83",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-183",
    "category": "Труба ВГП",
    "name": "Труба ВГП 25х 3.2",
    "priceTonNum": 60274.27,
    "priceUnit": "180,24",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-184",
    "category": "Труба ВГП",
    "name": "Труба ВГП 32х 2.8",
    "priceTonNum": 60414.18,
    "priceUnit": "200,53",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-185",
    "category": "Труба ВГП",
    "name": "Труба ВГП 32х 3.2",
    "priceTonNum": 60127.64,
    "priceUnit": "199,32",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-186",
    "category": "Труба ВГП",
    "name": "Труба ВГП 40х 3",
    "priceTonNum": 62964,
    "priceUnit": "181,16",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-187",
    "category": "Труба ВГП",
    "name": "Труба ВГП 50х 3",
    "priceTonNum": 58846.73,
    "priceUnit": "213,17",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-188",
    "category": "Труба ВГП",
    "name": "Труба ВГП 50х 3.5",
    "priceTonNum": 59503.49,
    "priceUnit": "195,3",
    "img": "/images/tubes.png",
    "length": "Мерная"
  },
  {
    "id": "docx-189",
    "category": "Труба ВГП",
    "name": "Труба ВГП 50х 4",
    "priceTonNum": 59866.84,
    "priceUnit": "186,1",
    "img": "/images/tubes.png",
    "length": "Мерная"
  }
];

if (typeof module !== 'undefined') module.exports = PRODUCTS;