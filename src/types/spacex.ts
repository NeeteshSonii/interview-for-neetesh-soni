export interface SpaceXLaunch {
  id: string;
  name: string;
  date_utc: string;
  date_unix: number;
  flight_number: number;
  success: boolean | null;
  upcoming: boolean;
  details: string | null;
  rocket: { name: string };
  orbit: string;
  payloads: { orbit: string }[];
  launchpad: { name: string };
  crew: string[];
  ships: string[];
  capsules: string[];
  cores: Core[];
  links: Links;
}

export interface Core {
  core: string | null;
  flight: number | null;
  gridfins: boolean | null;
  legs: boolean | null;
  reused: boolean | null;
  landing_attempt: boolean | null;
  landing_success: boolean | null;
  landing_type: string | null;
  landpad: string | null;
}

export interface Links {
  patch: {
    small: string | null;
    large: string | null;
  };
  reddit: {
    campaign: string | null;
    launch: string | null;
    media: string | null;
    recovery: string | null;
  };
  flickr: {
    small: string[];
    original: string[];
  };
  presskit: string | null;
  webcast: string | null;
  youtube_id: string | null;
  article: string | null;
  wikipedia: string | null;
}

export interface SpaceXRocket {
  id: string;
  name: string;
  type: string;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
  country: string;
  company: string;
  height: {
    meters: number;
    feet: number;
  };
  diameter: {
    meters: number;
    feet: number;
  };
  mass: {
    kg: number;
    lb: number;
  };
  payload_weights: Array<{
    id: string;
    name: string;
    kg: number;
    lb: number;
  }>;
  first_stage: {
    thrust_sea_level: {
      kN: number;
      lbf: number;
    };
    thrust_vacuum: {
      kN: number;
      lbf: number;
    };
    reusable: boolean;
    engines: number;
    fuel_amount_tons: number;
    burn_time_sec: number;
  };
  second_stage: {
    thrust: {
      kN: number;
      lbf: number;
    };
    payloads: {
      composite_fairing: {
        height: {
          meters: number;
          feet: number;
        };
        diameter: {
          meters: number;
          feet: number;
        };
      };
      option_1: string;
    };
    reusable: boolean;
    engines: number;
    fuel_amount_tons: number;
    burn_time_sec: number;
  };
  engines: {
    isp: {
      sea_level: number;
      vacuum: number;
    };
    thrust_sea_level: {
      kN: number;
      lbf: number;
    };
    thrust_vacuum: {
      kN: number;
      lbf: number;
    };
    number: number;
    type: string;
    version: string;
    layout: string;
    engine_loss_max: number;
    propellant_1: string;
    propellant_2: string;
    thrust_to_weight: number;
  };
  landing_legs: {
    number: number;
    material: string | null;
  };
  flickr_images: string[];
  wikipedia: string;
  description: string;
}