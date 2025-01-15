import mongoose from "mongoose";
function generateUniqueId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const ApartMentTypeArrayRemovePlotAndLand = [
    "Apartment",
    "Independent House/Villa",
    "1 RK/Studio Apartment",
    "Independent/Builder Floor",
    "Serviced Apartment",
  ];
  // Generate 8 random characters
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

const PostDetail = mongoose.Schema(
  {
    _id: {
      type: String, // or Number if you prefer numeric
      default: generateUniqueId, // Set the default value to the custom generator
      require: true,
    },
    BasicDetails: {
      PropertyType: {
        type: String,
        trim: true,
        required: [true, "Property Type Field is Required"],
        enum: ["Residential"],
      },
      PropertyAdType: {
        type: String,
        trim: true,
        required: [true, "PropertyAd Type Field is Required"],
        enum: ["Sale", "Rent"],
      },
      ApartmentType: {
        type: String,
        trim: true,
        required: [true, "Property Ad Type Field is Required"],
        enum: [
          "Apartment",
          "Independent House/Villa",
          "1 RK/Studio Apartment",
          "Independent/Builder Floor",
          "Serviced Apartment",
          "Plot/Land",
        ],
      },
      AvailableFrom: {
        type: Date,
        trim: true,
        default: undefined,
        required: [
          function () {
            return this.BasicDetails.PropertyAdType === "Rent";
          },
          "AvailableFrom is required for Rent properties.",
        ],

        validate: (value) => {
          if (value) {
            const selectedDate = new Date(value);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            if (selectedDate < currentDate) {
              throw new Error("Enter a Valid Date (today or in the future)");
            }
          }
        },
      },
      PropertyStatus: {
        type: String,
        trim: true,
        default: undefined,
        enum: ["Ready to move", "Under Construction"],
        required: [
          function () {
            return this.BasicDetails.PropertyAdType === "Sale";
          },
          "Property Status is required for Sale properties.",
        ],
      },
      CurrentPropertyStatus: {
        type: String,
        trim: true,
        default: undefined,
        required: [
          function () {
            return this.BasicDetails.PropertyStatus === "Ready to move";
          },
          "Current Property Status is required for Ready to move properties.",
        ],
      },
      PropertyAge: {
        type: String,
        trim: true,
        default: undefined,
        required: [
          function () {
            return this.BasicDetails.PropertyStatus === "Ready to move";
          },
          "Current Property Status is required for Ready to move properties.",
        ],
      },
      PossessionStatus: {
        type: String,
        trim: true,
        default: undefined,
        required: [
          function () {
            return this.BasicDetails.PropertyStatus === "Under Construction";
          },
          "Possession Status is required for Under Construction",
        ],
      },

      CurrentPropertyStatus: {
        type: String,
        trim: true,
        default: undefined,
        required: [
          function () {
            return this.BasicDetails.ApartmentType === "Plot/Land";
          },
          "Current Property Status Status is required",
        ],
      },

      NoOfOpenSide: {
        type: Number,
        trim: true,
        default: function () {
          // Set default value based on `propertyType`
          return this.BasicDetails.ApartmentType === "Plot/Land"
            ? 0
            : undefined;
        },
      },
    },

    PropertyDetails: {
      BHKType: {
        type: Number,
        trim: true,
        required: [true, "BHKType Type Field is Required"],
      },
      FlooringType: {
        type: String,
        trim: true,
        required: [true, "Flooring Type Field is Required"],
      },
      OtherRoom: {
        type: [String],
        default: undefined, // Default value is undefined if not provided
      },
      Bathroom: {
        type: Number,
        trim: true,
        required: [true, "Bathroom  Field is Required"],
      },
      Balcony: {
        type: Number,
        trim: true,
        required: [true, "Balcony  Field is Required"],
      },
      Parking: {
        CoveredParking: {
          type: Number,
          trim: true,
          required: [true, "CoveredParking Field is Required"],
        },
        OpenParking: {
          type: Number,
          trim: true,
          required: [true, "OpenParking Field is Required"],
        },
      },
    },

    FloorDetails: {
      PropertyOnFloor: {
        type: String,
        trim: true,
        required: [
          function () {
            return [
              "Apartment",
              "Independent/Builder Floor",
              "1 RK/Studio Apartment",
              "Serviced Apartment",
            ].includes(this.BasicDetails.ApartmentType);
          },
          "PropertyOnFloor is required ",
        ],
      },
      TotalFloors: {
        type: Number,
        trim: true,
        required: [true, "PropertyOnFloor  Field is Required"],
      },
      PropertyDirection: {
        type: String,
        trim: true,
        required: [true, "PropertyDirection  Field is Required"],
      },
      OverLookingView: {
        // type: String,
        // trim: true,

        type: [String],
        trim: true,
        validate: (arr) => {
          if (arr.length <= 0) {
            throw new Error("Water Source must contain at least one item");
          }
        },
        required: [true, "Over Looking View  Field is Required"],
      },
    },
    ConstructionDetails: {
      ConstructionAllowed: {
        type: Number,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.ApartmentType == "Plot/Land";
          },
          "Construction Allowed is required ",
        ],
        default: undefined,
      },
      PlotDirection: {
        type: String,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.ApartmentType == "Plot/Land";
          },
          "Plot Direction is required ",
        ],
        default: undefined,
      },

      PlotOverlooking: {
        type: String,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.ApartmentType == "Plot/Land";
          },
          "Plot Overlooking is required ",
        ],
        default: undefined,
      },
    },

    AreaDetails: {
      type: Object,
      required: [true, "AreaDetails is required"], // Ensures AreaDetails itself is not null
      validate: {
        validator: function () {
          if (
            this.AreaDetails.PlotArea?.value ||
            this.AreaDetails.PlotArea?.unit
          ) {
            return; // validate function not run
          }
          const areaUnits = [
            this.AreaDetails.SuperBuiltUpArea?.unit,
            this.AreaDetails.CarpetArea?.unit,
            this.AreaDetails.BuiltUpArea?.unit,
          ].filter((unit) => unit != null);

          const hasArea =
            this.AreaDetails.SuperBuiltUpArea?.value != null ||
            this.AreaDetails.CarpetArea?.value != null ||
            this.AreaDetails.BuiltUpArea?.value != null;

          const allUnitsMatch =
            areaUnits.length <= 1 ||
            areaUnits.every((unit) => unit === areaUnits[0]);

          return hasArea && allUnitsMatch;
        },
        message:
          "At least one area must be provided, and all area units must be the same.",
      },

      SuperBuiltUpArea: {
        value: {
          type: Number,
          trim: true,
          default: undefined,
        },
        unit: {
          type: String,
          trim: true,
          default: undefined,
        },
      },
      CarpetArea: {
        value: {
          type: Number,
          trim: true,
          default: undefined,
        },
        unit: {
          type: String,
          trim: true,
          default: undefined,
        },
      },
      BuiltUpArea: {
        value: {
          type: Number,
          trim: true,
          default: undefined,
        },
        unit: {
          type: String,
          trim: true,
          default: undefined,
        },
      },
      PlotArea: {
        value: {
          type: Number,
          trim: true,
          default: undefined,
          required: [
            function () {
              return ["Independent House/Villa"].includes(
                this.BasicDetails.ApartmentType
              );
            },
            "PlotArea Value is  Required",
          ],
        },
        unit: {
          type: String,
          trim: true,
          default: undefined,
          required: [
            function () {
              return ["Independent House/Villa"].includes(
                this.BasicDetails.ApartmentType
              );
            },
            "PlotArea Unit is  Required",
          ],
        },
      },
    },

    AmenitiesDetails: {
      Furnishing: {
        type: String,
        trim: true,
        enum: ["Furnished", "Semi-Furnished", "Un-Furnished"],
        required: [true, "Furnishing  Field is Required"],
      },
      FurnishingOption: {
        ModularKitchen: {
          type: Boolean,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? false
              : undefined;
          },
        },
        Wardrobe: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
        Light: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
        Fans: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
        Geyser: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
        AC: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
        TV: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
        Beds: {
          type: Number,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return ["Furnished", "Semi-Furnished"].includes(
              this.AmenitiesDetails.Furnishing
            )
              ? 0
              : undefined;
          },
        },
      },
      PowerBackUp: {
        type: String,
        trim: true,
        required: [true, "Power Backup Field is Required"],
      },
      WaterSource: {
        type: [String],
        trim: true,

        validate: (arr) => {
          if (arr.length <= 0) {
            throw new Error("Water Source must contain at least one item");
          }
        },
      },

      SocietyAndBuildingFeature: {
        type: [String],
        trim: true,
        validate: (arr) => {
          if (arr.length <= 0) {
            throw new Error("Water Source must contain at least one item");
          }
        },
      },
    },

    PricingDetails: {
      ExpectedRent: {
        type: Number,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.PropertyAdType === "Rent";
          },
          "ExpectedRent is required for Rent properties.",
        ],
      },
      DepositePrice: {
        type: Number,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.PropertyAdType === "Rent";
          },
          "DepositePrice is required for Rent properties.",
        ],
      },
      ExpectedPrice: {
        type: Number,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.PropertyAdType === "Sale";
          },
          "ExpectedPrice is required for Sale properties.",
        ],
      },
      PricePerSqFt: {
        type: Number,
        trim: true,
        required: [
          function () {
            return this.BasicDetails.PropertyAdType === "Sale";
          },
          "PricePerSqFt is required for Sale properties.",
        ],
      },

      AdditionalDetails: {
        MaintenanceCharges: { type: Number, trim: true, default: undefined },
        ElectrictyAndWaterCharges: {
          type: Boolean,
          trim: true,
          default: function () {
            // Set default value based on `propertyType`
            return this.BasicDetails.PropertyAdType === "Rent"
              ? false
              : undefined;
          },
        },

        PreferredTenant: {
          type: [String],
          default: undefined,
        },

        MonthlyExpectedRent: {
          type: Number,
          trim: true,
          default: undefined,
        },
      },
    },

    LocationDetails: {
      City: {
        type: String,
        trim: true,
        required: [true, "City is Required"],
      },
      Locality: {
        type: String,
        trim: true,
        required: [true, "Locality is Required"],
      },
      Landmark: {
        type: String,
        trim: true,
        required: [true, " Landmark / Street  is Required"],
      },
      ProjectName: {
        type: String,
        trim: true,
        required: [true, "ProjectName  is Required"],
      },
    },

    PropertyImages: [
      {
        name: {
          type: String,
          trim: true,
          required: true,
        },
        public_id: {
          type: String,
          trim: true,
          required: true,
        },
        url: {
          type: String,
          trim: true,
          required: true,
        },
      },
    ],

    CreatePostUser: {
      type: mongoose.Schema.ObjectId,
      trim: true,
      ref: "UserDetail",
      required: true,
    },

    createAt: {
      type: Date,
      trim: true,
      default: Date.now(),
    },

    PostVerify: {
      type: Boolean,
      trim: true,
      default: false,
    },

    PostExpired: {
      ExpiredStatus: {
        type: Boolean,
        trim: true,
        default: undefined,
      },
      ExpiredTime: {
        type: Date,
        trim: true,
        default: undefined,
      },
    },
    PostExtend: {
      PostExtendStatus: {
        type: Boolean,
        trim: true,
        default: undefined,
      },
      PostExtendTime: {
        type: Date,
        trim: true,
        default: undefined,
      },
    },

    // PostExtendTime:{ }

    PostVerifyData: {
      PostVerifyUser: {
        type: mongoose.Schema.ObjectId,
        trim: true,
        ref: "AdminAndOwnerDetail",
      },
      Time: { type: Date, trim: true },
    },

    // postVerifyExpiresAt: {
    //   type: Date,
    //   default: function () {
    //     // Set postVerifyExpiresAt based on PostVerifyData.Time, if provided
    //     return this.PostVerifyData?.Time
    //       ? new Date(this.PostVerifyData.Time.getTime() + 5 * 60 * 1000) // Add 5 minutes
    //       : undefined; // Default to now + 5 minutes
    //   },
    // },
  },
  { strict: true }
);
PostDetail.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    if (this.getUpdate()._id) {
      throw new Error("_id cannot be modified");
    }
    next();
  }
);
PostDetail.pre("save", function (next) {
  if (this.isModified("_id")) {
    throw new Error("_id cannot be modified");
  }

  // if (this.isModified("BasicDetails.AvailableFrom") && this.BasicDetails.AvailableFrom <= Date.now()) {
  //   throw new Error("Enter a Valid Date");
  // }

  next();
});
const PostModel = mongoose.model("PostDetail", PostDetail);
export default PostModel;
