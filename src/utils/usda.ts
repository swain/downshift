import { SSMProvider } from "@aws-lambda-powertools/parameters/ssm";
import axios from "axios";
import { APIClient } from "./api-client";

// USDA Food Data Central API Types
// Generated from OpenAPI specification

export type DataType =
  | "Branded"
  | "Foundation"
  | "Survey (FNDDS)"
  | "SR Legacy";
export type Format = "abridged" | "full";
export type SortBy =
  | "dataType.keyword"
  | "lowercaseDescription.keyword"
  | "fdcId"
  | "publishedDate";
export type SortOrder = "asc" | "desc";

// Base food item interface
export interface BaseFoodItem {
  fdcId: number;
  dataType: string;
  description: string;
}

// Abridged food nutrient
export interface AbridgedFoodNutrient {
  number?: number;
  name?: string;
  amount?: number;
  unitName?: string;
  derivationCode?: string;
  derivationDescription?: string;
}

// Abridged food item
export interface AbridgedFoodItem extends BaseFoodItem {
  foodNutrients?: AbridgedFoodNutrient[];
  publicationDate?: string;
  brandOwner?: string; // only applies to Branded Foods
  gtinUpc?: string; // only applies to Branded Foods
  ndbNumber?: string; // only applies to Foundation and SRLegacy Foods
  foodCode?: string; // only applies to Survey Foods
}

// Nutrient
export interface Nutrient {
  id?: number;
  number?: string;
  name?: string;
  rank?: number;
  unitName?: string;
}

// Food nutrient source
export interface FoodNutrientSource {
  id?: number;
  code?: string;
  description?: string;
}

// Food nutrient derivation
export interface FoodNutrientDerivation {
  id?: number;
  code?: string;
  description?: string;
  foodNutrientSource?: FoodNutrientSource;
}

// Nutrient acquisition details
export interface NutrientAcquisitionDetails {
  sampleUnitId?: number;
  purchaseDate?: string;
  storeCity?: string;
  storeState?: string;
}

// Nutrient analysis details
export interface NutrientAnalysisDetails {
  subSampleId?: number;
  amount?: number;
  nutrientId?: number;
  labMethodDescription?: string;
  labMethodOriginalDescription?: string;
  labMethodLink?: string;
  labMethodTechnique?: string;
  nutrientAcquisitionDetails?: NutrientAcquisitionDetails[];
}

// Food nutrient
export interface FoodNutrient {
  id?: number;
  amount?: number;
  dataPoints?: number;
  min?: number;
  max?: number;
  median?: number;
  type?: string;
  nutrient?: Nutrient;
  foodNutrientDerivation?: FoodNutrientDerivation;
  nutrientAnalysisDetails?: NutrientAnalysisDetails;
}

// Nutrient conversion factors
export interface NutrientConversionFactors {
  type?: string;
  value?: number;
}

// Food update log
export interface FoodUpdateLog {
  fdcId?: number;
  availableDate?: string;
  brandOwner?: string;
  dataSource?: string;
  dataType?: string;
  description?: string;
  foodClass?: string;
  gtinUpc?: string;
  householdServingFullText?: string;
  ingredients?: string;
  modifiedDate?: string;
  publicationDate?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  brandedFoodCategory?: string;
  changes?: string;
  foodAttributes?: FoodAttribute[];
}

// Food attribute type
export interface FoodAttributeType {
  id?: number;
  name?: string;
  description?: string;
}

// Food attribute
export interface FoodAttribute {
  id?: number;
  sequenceNumber?: number;
  value?: string;
  FoodAttributeType?: FoodAttributeType;
}

// Label nutrients
export interface LabelNutrientValue {
  value?: number;
}

export interface LabelNutrients {
  fat?: LabelNutrientValue;
  saturatedFat?: LabelNutrientValue;
  transFat?: LabelNutrientValue;
  cholesterol?: LabelNutrientValue;
  sodium?: LabelNutrientValue;
  carbohydrates?: LabelNutrientValue;
  fiber?: LabelNutrientValue;
  sugars?: LabelNutrientValue;
  protein?: LabelNutrientValue;
  calcium?: LabelNutrientValue;
  iron?: LabelNutrientValue;
  postassium?: LabelNutrientValue;
  calories?: LabelNutrientValue;
}

// Branded food item
export interface BrandedFoodItem extends BaseFoodItem {
  availableDate?: string;
  brandOwner?: string;
  dataSource?: string;
  foodClass?: string;
  gtinUpc?: string;
  householdServingFullText?: string;
  ingredients?: string;
  modifiedDate?: string;
  publicationDate?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  brandedFoodCategory?: string;
  foodNutrients?: FoodNutrient[];
  foodUpdateLog?: FoodUpdateLog[];
  labelNutrients?: LabelNutrients;
}

// Food category
export interface FoodCategory {
  id?: number;
  code?: string;
  description?: string;
}

// Food component
export interface FoodComponent {
  id?: number;
  name?: string;
  dataPoints?: number;
  gramWeight?: number;
  isRefuse?: boolean;
  minYearAcquired?: number;
  percentWeight?: number;
}

// Measure unit
export interface MeasureUnit {
  id?: number;
  abbreviation?: string;
  name?: string;
}

// Food portion
export interface FoodPortion {
  id?: number;
  amount?: number;
  dataPoints?: number;
  gramWeight?: number;
  minYearAcquired?: number;
  modifier?: string;
  portionDescription?: string;
  sequenceNumber?: number;
  measureUnit?: MeasureUnit;
}

// Sample food item
export interface SampleFoodItem extends BaseFoodItem {
  foodClass?: string;
  publicationDate?: string;
  foodAttributes?: FoodCategory[];
}

// Input food foundation
export interface InputFoodFoundation {
  id?: number;
  foodDescription?: string;
  inputFood?: SampleFoodItem;
}

// Foundation food item
export interface FoundationFoodItem extends BaseFoodItem {
  foodClass?: string;
  footNote?: string;
  isHistoricalReference?: boolean;
  ndbNumber?: string;
  publicationDate?: string;
  scientificName?: string;
  foodCategory?: FoodCategory;
  foodComponents?: FoodComponent[];
  foodNutrients?: FoodNutrient[];
  foodPortions?: FoodPortion[];
  inputFoods?: InputFoodFoundation[];
  nutrientConversionFactors?: NutrientConversionFactors[];
}

// SR Legacy food item
export interface SRLegacyFoodItem extends BaseFoodItem {
  foodClass?: string;
  isHistoricalReference?: boolean;
  ndbNumber?: string;
  publicationDate?: string;
  scientificName?: string;
  foodCategory?: FoodCategory;
  foodNutrients?: FoodNutrient[];
  nutrientConversionFactors?: NutrientConversionFactors[];
}

// Retention factor
export interface RetentionFactor {
  id?: number;
  code?: number;
  description?: string;
}

// Input food survey
export interface InputFoodSurvey {
  id?: number;
  amount?: number;
  foodDescription?: string;
  ingredientCode?: number;
  ingredientDescription?: string;
  ingredientWeight?: number;
  portionCode?: string;
  portionDescription?: string;
  sequenceNumber?: number;
  surveyFlag?: number;
  unit?: string;
  inputFood?: SurveyFoodItem;
  retentionFactor?: RetentionFactor;
}

// WWEIA food category
export interface WweiaFoodCategory {
  wweiaFoodCategoryCode?: number;
  wweiaFoodCategoryDescription?: string;
}

// Survey food item
export interface SurveyFoodItem extends BaseFoodItem {
  datatype?: string;
  endDate?: string;
  foodClass?: string;
  foodCode?: string;
  publicationDate?: string;
  startDate?: string;
  foodAttributes?: FoodAttribute[];
  foodPortions?: FoodPortion[];
  inputFoods?: InputFoodSurvey[];
  wweiaFoodCategory?: WweiaFoodCategory;
}

// Union type for all food items
export type FoodItem =
  | AbridgedFoodItem
  | BrandedFoodItem
  | FoundationFoodItem
  | SRLegacyFoodItem
  | SurveyFoodItem;

// Request body types
export interface FoodsCriteria {
  fdcIds: number[];
  format?: Format;
  nutrients?: number[];
}

export interface FoodListCriteria {
  dataType?: DataType[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface FoodSearchCriteria {
  query?: string;
  dataType?: DataType[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  brandOwner?: string;
}

// Search result food
export interface SearchResultFood extends BaseFoodItem {
  foodCode?: string;
  foodNutrients?: AbridgedFoodNutrient[];
  publicationDate?: string;
  scientificName?: string;
  brandOwner?: string;
  gtinUpc?: string;
  ingredients?: string;
  ndbNumber?: string;
  additionalDescriptions?: string;
  allHighlightFields?: string;
  score?: number;
}

// Search result
export interface SearchResult {
  foodSearchCriteria?: FoodSearchCriteria;
  totalHits?: number;
  currentPage?: number;
  totalPages?: number;
  foods?: SearchResultFood[];
}

// API parameter types
export interface GetFoodParams {
  fdcId: string;
  format?: Format;
  nutrients?: number[];
}

export interface GetFoodsParams {
  fdcIds: string[];
  format?: Format;
  nutrients?: number[];
}

export interface GetFoodsListParams {
  dataType?: DataType[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface GetFoodsSearchParams {
  query: string;
  dataType?: DataType[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  brandOwner?: string;
}

export type USDAEndpoints = {
  "GET /food/:fdcId": {
    Request: GetFoodParams;
    Response: FoodItem;
  };
  "GET /foods": {
    Request: GetFoodsParams;
    Response: FoodItem[];
  };
  "POST /foods": {
    Request: FoodsCriteria;
    Response: FoodItem[];
  };
  "GET /foods/list": {
    Request: GetFoodsListParams;
    Response: AbridgedFoodItem[];
  };
  "POST /foods/list": {
    Request: FoodListCriteria;
    Response: AbridgedFoodItem[];
  };
  "GET /foods/search": {
    Request: GetFoodsSearchParams;
    Response: SearchResult[];
  };
  "POST /foods/search": {
    Request: FoodSearchCriteria;
    Response: SearchResult[];
  };
};

const ssm = new SSMProvider();

const client = axios.create({
  baseURL: "https://api.nal.usda.gov/fdc/v1",
});

client.interceptors.request.use(async (req) => {
  const apiKey = await ssm.get("usda-api-key");
  if (!apiKey) {
    throw new Error("could not fetch api key from SSM");
  }
  req.headers.set("X-Api-Key", apiKey);

  return req;
});

export const usda = new APIClient<USDAEndpoints>(client);
