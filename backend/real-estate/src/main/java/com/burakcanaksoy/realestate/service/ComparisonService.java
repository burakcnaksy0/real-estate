package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.exception.InvalidComparisonException;
import com.burakcanaksoy.realestate.model.*;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.ListingRepository;
import com.burakcanaksoy.realestate.response.ComparisonFieldResponse;
import com.burakcanaksoy.realestate.response.ComparisonResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ComparisonService {

    private final ListingRepository listingRepository;
    private final ImageRepository imageRepository;

    @Transactional(readOnly = true)
    public ComparisonResponse compareListings(List<Long> listingIds) {
        // Validate input
        if (listingIds == null || listingIds.size() < 2 || listingIds.size() > 3) {
            throw new InvalidComparisonException("Karşılaştırma için 2 veya 3 ilan seçmelisiniz");
        }

        // Fetch all listings with category in a single query
        List<BaseListing> listings = listingRepository.findAllById(listingIds);

        // Validate all listings exist
        if (listings.size() != listingIds.size()) {
            throw new EntityNotFoundException("Bir veya daha fazla ilan bulunamadı");
        }

        // Validate all listings belong to the same category
        String categorySlug = listings.get(0).getCategory().getSlug();
        boolean allSameCategory = listings.stream()
                .allMatch(listing -> listing.getCategory().getSlug().equals(categorySlug));

        if (!allSameCategory) {
            throw new InvalidComparisonException("Sadece aynı kategorideki ilanlar karşılaştırılabilir");
        }

        // Build comparison response based on category
        List<ComparisonFieldResponse> fields = buildComparisonFields(listings, categorySlug);

        // Build listings map for header display
        Map<String, Object> listingsMap = new LinkedHashMap<>();
        for (BaseListing listing : listings) {
            Map<String, Object> listingData = new HashMap<>();
            listingData.put("id", listing.getId());
            listingData.put("title", listing.getTitle());
            listingData.put("price", formatPrice(listing.getPrice(), listing.getCurrency().name()));
            listingData.put("city", listing.getCity());
            listingData.put("district", listing.getDistrict());

            // Add image URL if available
            String imageUrl = getFirstImageUrl(listing);
            if (imageUrl != null) {
                listingData.put("imageUrl", imageUrl);
            }

            listingsMap.put(String.valueOf(listing.getId()), listingData);
        }

        return ComparisonResponse.builder()
                .category(categorySlug)
                .fields(fields)
                .listings(listingsMap)
                .build();
    }

    private List<ComparisonFieldResponse> buildComparisonFields(List<BaseListing> listings, String categorySlug) {
        List<ComparisonFieldResponse> fields = new ArrayList<>();

        // Common fields for all categories
        fields.add(buildField("Fiyat", listings,
                listing -> formatPrice(listing.getPrice(), listing.getCurrency().name())));
        fields.add(buildField("Şehir", listings, BaseListing::getCity));
        fields.add(buildField("İlçe", listings, BaseListing::getDistrict));

        // Category-specific fields
        switch (categorySlug) {
            case "arac":
            case "vehicle":
                addVehicleFields(fields, listings);
                break;
            case "emlak":
            case "real-estate":
                addRealEstateFields(fields, listings);
                break;
            case "arsa":
            case "land":
                addLandFields(fields, listings);
                break;
            case "isyeri":
            case "workplace":
                addWorkplaceFields(fields, listings);
                break;
        }

        return fields;
    }

    private void addVehicleFields(List<ComparisonFieldResponse> fields, List<BaseListing> listings) {
        List<Vehicle> vehicles = listings.stream()
                .filter(l -> l instanceof Vehicle)
                .map(l -> (Vehicle) l)
                .toList();

        fields.add(buildField("Marka", vehicles, Vehicle::getBrand));
        fields.add(buildField("Seri", vehicles, v -> v.getSeries() != null ? v.getSeries() : "—"));
        fields.add(buildField("Model", vehicles, Vehicle::getModel));
        fields.add(buildField("Yıl", vehicles, v -> String.valueOf(v.getYear())));
        fields.add(buildField("Yakıt Tipi", vehicles, v -> translateEnum(v.getFuelType().name())));
        fields.add(buildField("Vites", vehicles, v -> translateEnum(v.getTransmission().name())));
        fields.add(buildField("Araç Durumu", vehicles,
                v -> v.getVehicleStatus() != null ? v.getVehicleStatus() : "—"));
        fields.add(buildField("KM", vehicles, v -> formatNumber(v.getKilometer()) + " km"));
        fields.add(buildField("Kasa Tipi", vehicles,
                v -> v.getBodyType() != null ? v.getBodyType() : "—"));
        fields.add(
                buildField("Motor Gücü", vehicles, v -> v.getEnginePower() != null ? v.getEnginePower() + " hp" : "—"));
        fields.add(buildField("Motor Hacmi", vehicles,
                v -> v.getEngineVolume() != null ? v.getEngineVolume() + " cc" : "—"));
        fields.add(buildField("Çekiş", vehicles,
                v -> v.getTractionType() != null ? v.getTractionType() : "—"));
        fields.add(buildField("Renk", vehicles, v -> v.getColor() != null ? v.getColor() : "—"));
        fields.add(buildField("Garanti", vehicles,
                v -> v.getWarranty() != null ? (v.getWarranty() ? "Evet" : "Hayır") : "—"));
        fields.add(buildField("Ağır Hasar Kayıtlı", vehicles,
                v -> v.getHeavyDamage() != null ? (v.getHeavyDamage() ? "Evet" : "Hayır") : "—"));
        fields.add(buildField("Plaka / Uyruk", vehicles,
                v -> v.getPlateNationality() != null ? v.getPlateNationality() : "—"));
        fields.add(buildField("Kimden", vehicles,
                v -> v.getFromWho() != null ? v.getFromWho() : "—"));
        fields.add(buildField("Takas", vehicles,
                v -> v.getExchange() != null ? (v.getExchange() ? "Evet" : "Hayır") : "—"));
    }

    private void addRealEstateFields(List<ComparisonFieldResponse> fields, List<BaseListing> listings) {
        List<RealEstate> realEstates = listings.stream()
                .filter(l -> l instanceof RealEstate)
                .map(l -> (RealEstate) l)
                .toList();

        fields.add(buildField("Emlak Tipi", realEstates, re -> translateEnum(re.getRealEstateType().name())));
        fields.add(buildField("Oda Sayısı", realEstates, re -> String.valueOf(re.getRoomCount())));
        fields.add(buildField("Metrekare", realEstates, re -> formatNumber(re.getGrossSquareMeter()) + " m²"));
        fields.add(buildField("Bina Yaşı", realEstates, re -> re.getBuildingAge() + " yıl"));
        fields.add(buildField("Kat", realEstates, re -> re.getFloor() != null ? String.valueOf(re.getFloor()) : "—"));
        fields.add(buildField("Isıtma", realEstates,
                re -> re.getHeatingType() != null ? translateEnum(re.getHeatingType().name()) : "—"));
        fields.add(buildField("Eşyalı", realEstates, re -> re.getFurnished() ? "Evet" : "Hayır"));
    }

    private void addLandFields(List<ComparisonFieldResponse> fields, List<BaseListing> listings) {
        List<Land> lands = listings.stream()
                .filter(l -> l instanceof Land)
                .map(l -> (Land) l)
                .toList();

        fields.add(buildField("Arsa Tipi", lands, l -> translateEnum(l.getLandType().name())));
        fields.add(buildField("Metrekare", lands, l -> formatNumber(l.getSquareMeter()) + " m²"));
        fields.add(buildField("İmar Durumu", lands, l -> l.getZoningStatus() != null ? l.getZoningStatus() : "—"));
        fields.add(buildField("Parsel No", lands, l -> String.valueOf(l.getParcelNumber())));
        fields.add(buildField("Ada No", lands, l -> String.valueOf(l.getIslandNumber())));
    }

    private void addWorkplaceFields(List<ComparisonFieldResponse> fields, List<BaseListing> listings) {
        List<Workplace> workplaces = listings.stream()
                .filter(l -> l instanceof Workplace)
                .map(l -> (Workplace) l)
                .toList();

        fields.add(buildField("İşyeri Tipi", workplaces, w -> translateEnum(w.getWorkplaceType().name())));
        fields.add(buildField("Metrekare", workplaces, w -> formatNumber(w.getSquareMeter()) + " m²"));
        fields.add(buildField("Kat Sayısı", workplaces, w -> String.valueOf(w.getFloorCount())));
        fields.add(buildField("Eşyalı", workplaces, w -> w.getFurnished() ? "Evet" : "Hayır"));
    }

    private <T> ComparisonFieldResponse buildField(String fieldName, List<T> items, FieldExtractor<T> extractor) {
        Map<String, String> values = new LinkedHashMap<>();
        for (T item : items) {
            BaseListing listing = (BaseListing) item;
            String value = extractor.extract(item);
            values.put(String.valueOf(listing.getId()), value != null ? value : "—");
        }
        return ComparisonFieldResponse.builder()
                .fieldName(fieldName)
                .values(values)
                .build();
    }

    private String formatPrice(BigDecimal price, String currency) {
        NumberFormat formatter = NumberFormat.getInstance(new Locale("tr", "TR"));
        String formattedPrice = formatter.format(price);
        String currencySymbol = currency.equals("TRY") ? "₺" : currency;
        return formattedPrice + " " + currencySymbol;
    }

    private String formatNumber(Integer number) {
        NumberFormat formatter = NumberFormat.getInstance(new Locale("tr", "TR"));
        return formatter.format(number);
    }

    private String translateEnum(String enumValue) {
        // Basic translation map - can be extended
        Map<String, String> translations = Map.ofEntries(
                // Fuel Types
                Map.entry("GASOLINE", "Benzin"),
                Map.entry("DIESEL", "Dizel"),
                Map.entry("LPG", "LPG"),
                Map.entry("ELECTRIC", "Elektrik"),
                Map.entry("HYBRID", "Hibrit"),

                // Transmission
                Map.entry("MANUAL", "Manuel"),
                Map.entry("AUTOMATIC", "Otomatik"),
                Map.entry("SEMI_AUTOMATIC", "Yarı Otomatik"),

                // Vehicle Status
                Map.entry("ZERO", "Sıfır"),
                Map.entry("SECOND_HAND", "İkinci El"),

                // Body Types
                Map.entry("SEDAN", "Sedan"),
                Map.entry("HATCHBACK", "Hatchback"),
                Map.entry("STATION_WAGON", "Station Wagon"),
                Map.entry("CABRIO", "Cabrio"),
                Map.entry("SUV", "SUV"),
                Map.entry("PICKUP", "Kamyonet"),
                Map.entry("MINIVAN", "Minivan"),
                Map.entry("PANELVAN", "Panelvan"),
                Map.entry("COUPE", "Coupe"),

                // Traction Types
                Map.entry("FWD", "Önden Çekiş"),
                Map.entry("RWD", "Arkadan İtiş"),
                Map.entry("AWD", "4 Çeker (AWD)"),

                // Listing From
                Map.entry("OWNER", "Sahibinden"),
                Map.entry("GALLERY", "Galeriden"),
                Map.entry("AUTHORIZED_DEALER", "Yetkili Bayiden"),
                Map.entry("BANK", "Bankadan"),

                // Real Estate Types
                Map.entry("APARTMENT", "Daire"),
                Map.entry("VILLA", "Villa"),
                Map.entry("HOUSE", "Ev"),
                Map.entry("RESIDENCE", "Rezidans"),

                // Heating Types
                Map.entry("NATURAL_GAS", "Doğalgaz"),
                Map.entry("STOVE", "Soba"),
                Map.entry("CENTRAL", "Merkezi"),
                Map.entry("FLOOR_HEATING", "Yerden Isıtma"),
                Map.entry("STOVE_HEATING", "Soba"),
                Map.entry("CENTRAL_HEATING", "Merkezi Isıtma"),
                Map.entry("AIR_CONDITIONING", "Klima"),

                // Land Types
                Map.entry("AGRICULTURAL", "Tarla"),
                Map.entry("RESIDENTIAL", "Konut İmarlı"),
                Map.entry("COMMERCIAL", "Ticari İmarlı"),
                Map.entry("LAND", "Arsa"),
                Map.entry("FIELD", "Tarla"),
                Map.entry("VINEYARD", "Bağ"),
                Map.entry("GARDEN", "Bahçe"),

                // Workplace Types
                Map.entry("OFFICE", "Ofis"),
                Map.entry("SHOP", "Dükkan"),
                Map.entry("WAREHOUSE", "Depo"),
                Map.entry("FACTORY", "Fabrika"));

        return translations.getOrDefault(enumValue, enumValue);
    }

    @FunctionalInterface
    private interface FieldExtractor<T> {
        String extract(T item);
    }

    private String getFirstImageUrl(BaseListing listing) {
        // Determine listing type
        String listingType;
        if (listing instanceof Vehicle) {
            listingType = "VEHICLE";
        } else if (listing instanceof RealEstate) {
            listingType = "REAL_ESTATE";
        } else if (listing instanceof Land) {
            listingType = "LAND";
        } else if (listing instanceof Workplace) {
            listingType = "WORKPLACE";
        } else {
            return null;
        }

        return imageRepository.findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(listing.getId(), listingType)
                .map(Image::getFilePath)
                .orElse(null);
    }
}
