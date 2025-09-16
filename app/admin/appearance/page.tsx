"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  GripVertical,
  ImageIcon,
  Layout,
  LinkIcon,
  Loader2,
  Palette,
  Plus,
  Save,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  backgroundColor: string;
  textColor: string;
  overlayOpacity: number;
  sortOrder: number;
  isActive: boolean;
}

interface AppearanceSettings {
  // Branding
  siteName: string;
  siteTagline: string;
  siteLogo: { url: string; alt: string };
  siteFavicon: { url: string };

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: { url: string };

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Typography
  primaryFont: string;
  headingFont: string;
  baseFontSize: number;
  lineHeight: number;

  // Layout
  containerWidth: "standard" | "wide" | "full";
  headerStyle: "standard" | "centered";
  productGridColumns: number;
  stickyHeader: boolean;
  roundedCorners: boolean;
  dropShadows: boolean;

  // Homepage
  heroTitle: string;
  heroSubtitle: string;
  heroCTAText: string;
  heroBackground: { url: string; type: "image" | "color" };
  showHeroSearch: boolean;
  showFeaturedCategories: boolean;
  showFeaturedProducts: boolean;
  showTopVendors: boolean;
  showTestimonials: boolean;
  showNewsletterSignup: boolean;
  featuredProductsCount: number;

  // Footer
  footerText: string;
  showSocialLinks: boolean;
  showNewsletterFooter: boolean;
  showPaymentMethods: boolean;

  // Social Media
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialYoutube: string;
  socialTiktok: string;
}

export default function AppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    // Branding
    siteName: "MarketPlace Pro",
    siteTagline: "Your premier destination for quality products",
    siteLogo: { url: "", alt: "MarketPlace Pro Logo" },
    siteFavicon: { url: "" },

    // SEO
    metaTitle: "MarketPlace Pro - Quality Products from Trusted Vendors",
    metaDescription:
      "Discover quality products from verified vendors. Shop electronics, fashion, home goods and more.",
    metaKeywords: "marketplace, ecommerce, online shopping, vendors",
    ogImage: { url: "" },

    // Colors
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",

    // Typography
    primaryFont: "Inter",
    headingFont: "Inter",
    baseFontSize: 16,
    lineHeight: 1.5,

    // Layout
    containerWidth: "standard",
    headerStyle: "standard",
    productGridColumns: 4,
    stickyHeader: true,
    roundedCorners: true,
    dropShadows: true,

    // Homepage
    heroTitle: "Discover Amazing Products from Trusted Vendors",
    heroSubtitle:
      "Shop from thousands of products across multiple categories with fast shipping and secure checkout.",
    heroCTAText: "Start Shopping",
    heroBackground: { url: "", type: "image" },
    showHeroSearch: true,
    showFeaturedCategories: true,
    showFeaturedProducts: true,
    showTopVendors: true,
    showTestimonials: false,
    showNewsletterSignup: true,
    featuredProductsCount: 12,

    // Footer
    footerText: "© 2024 MarketPlace Pro. All rights reserved.",
    showSocialLinks: true,
    showNewsletterFooter: true,
    showPaymentMethods: true,

    // Social Media
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialLinkedin: "",
    socialYoutube: "",
    socialTiktok: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const colorPresets = [
    {
      name: "Blue",
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#10b981",
    },
    {
      name: "Purple",
      primary: "#8b5cf6",
      secondary: "#64748b",
      accent: "#f59e0b",
    },
    {
      name: "Green",
      primary: "#10b981",
      secondary: "#64748b",
      accent: "#3b82f6",
    },
    {
      name: "Red",
      primary: "#ef4444",
      secondary: "#64748b",
      accent: "#8b5cf6",
    },
    {
      name: "Orange",
      primary: "#f97316",
      secondary: "#64748b",
      accent: "#10b981",
    },
  ];

  const fontOptions = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Source Sans Pro",
    "Nunito",
  ];

  // Load settings and hero slides on component mount
  useEffect(() => {
    loadSettings();
    loadHeroSlides();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/appearance");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast.error("Failed to load appearance settings");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load appearance settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/appearance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: string) => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Update settings based on upload type
        setSettings((prev) => {
          const updated = { ...prev };
          switch (type) {
            case "logo":
              updated.siteLogo = { ...updated.siteLogo, url: data.url };
              break;
            case "favicon":
              updated.siteFavicon = { url: data.url };
              break;
            case "hero-bg":
              updated.heroBackground = {
                ...updated.heroBackground,
                url: data.url,
              };
              break;
            case "og-image":
              updated.ogImage = { url: data.url };
              break;
          }
          return updated;
        });

        toast.success("File uploaded successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(null);
    }
  };

  const updateSetting = (key: keyof AppearanceSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadHeroSlides = async () => {
    setLoadingSlides(true);
    try {
      const response = await fetch("/api/admin/hero-slides");
      if (response.ok) {
        const slides = await response.json();
        setHeroSlides(slides);
      } else {
        toast.error("Failed to load hero slides");
      }
    } catch (error) {
      console.error("Error loading hero slides:", error);
      toast.error("Failed to load hero slides");
    } finally {
      setLoadingSlides(false);
    }
  };

  const saveHeroSlides = async () => {
    try {
      const response = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heroSlides),
      });

      if (response.ok) {
        toast.success("Hero slides saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save hero slides");
      }
    } catch (error) {
      console.error("Error saving hero slides:", error);
      toast.error("Failed to save hero slides");
    }
  };

  const addHeroSlide = async () => {
    try {
      const newSlide = {
        title: "New Hero Slide",
        subtitle: "Add your subtitle here",
        ctaText: "Shop Now",
        ctaLink: "/categories",
        backgroundImage: "",
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
        overlayOpacity: 0.4,
        sortOrder: heroSlides.length,
        isActive: true,
      };

      const response = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSlide),
      });

      if (response.ok) {
        const createdSlide = await response.json();
        setHeroSlides((prev) => [...prev, createdSlide]);
        toast.success("New hero slide added!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add hero slide");
      }
    } catch (error) {
      console.error("Error adding hero slide:", error);
      toast.error("Failed to add hero slide");
    }
  };

  const deleteHeroSlide = async (slideId: string) => {
    try {
      const response = await fetch(`/api/admin/hero-slides/${slideId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHeroSlides((prev) => prev.filter((slide) => slide.id !== slideId));
        toast.success("Hero slide deleted!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete hero slide");
      }
    } catch (error) {
      console.error("Error deleting hero slide:", error);
      toast.error("Failed to delete hero slide");
    }
  };

  const updateHeroSlide = (slideId: string, updates: Partial<HeroSlide>) => {
    setHeroSlides((prev) =>
      prev.map((slide) =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    );
  };

  const handleSlideImageUpload = async (file: File, slideId: string) => {
    setUploading(slideId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", `hero-slide-${slideId}`);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateHeroSlide(slideId, { backgroundImage: data.url });
        toast.success("Hero background uploaded successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading hero background:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appearance Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Customize your marketplace's look and feel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
          </Button>
          <Button
            onClick={async () => {
              setSaving(true);
              await Promise.all([saveSettings(), saveHeroSlides()]);
              setSaving(false);
            }}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Brand Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting("siteName", e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This appears in the header and browser title
                  </p>
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.siteTagline}
                    onChange={(e) =>
                      updateSetting("siteTagline", e.target.value)
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Short description shown on homepage
                  </p>
                </div>

                <div>
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      {settings.siteLogo.url ? (
                        <img
                          src={settings.siteLogo.url}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "logo");
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploading === "logo"}
                      >
                        {uploading === "logo" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Logo
                      </Button>
                      <p className="text-sm text-gray-600 mt-1">
                        Recommended: 200x60px, PNG or SVG
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                      {settings.siteFavicon.url ? (
                        <img
                          src={settings.siteFavicon.url}
                          alt="Favicon"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "favicon");
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={uploading === "favicon"}
                      >
                        {uploading === "favicon" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Favicon
                      </Button>
                      <p className="text-sm text-gray-600 mt-1">
                        32x32px ICO or PNG file
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO & Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.metaTitle}
                    onChange={(e) => updateSetting("metaTitle", e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Appears in search results (50-60 characters)
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.metaDescription}
                    onChange={(e) =>
                      updateSetting("metaDescription", e.target.value)
                    }
                    rows={3}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Search result snippet (150-160 characters)
                  </p>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={settings.metaKeywords}
                    onChange={(e) =>
                      updateSetting("metaKeywords", e.target.value)
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Comma-separated keywords
                  </p>
                </div>

                <div>
                  <Label htmlFor="ogImage">Social Media Image</Label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={ogImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "og-image");
                      }}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => ogImageInputRef.current?.click()}
                      disabled={uploading === "og-image"}
                    >
                      {uploading === "og-image" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Image
                    </Button>
                    <p className="text-sm text-gray-600">
                      1200x630px for social sharing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        id="primaryColor"
                        value={settings.primaryColor}
                        onChange={(e) =>
                          updateSetting("primaryColor", e.target.value)
                        }
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) =>
                          updateSetting("primaryColor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={(e) =>
                          updateSetting("secondaryColor", e.target.value)
                        }
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) =>
                          updateSetting("secondaryColor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        id="accentColor"
                        value={settings.accentColor}
                        onChange={(e) =>
                          updateSetting("accentColor", e.target.value)
                        }
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) =>
                          updateSetting("accentColor", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Color Presets</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          updateSetting("primaryColor", preset.primary);
                          updateSetting("secondaryColor", preset.secondary);
                          updateSetting("accentColor", preset.accent);
                        }}
                        className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex gap-1 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <p className="text-white font-medium">Primary Color</p>
                    <p className="text-white/80 text-sm">
                      Used for buttons, links, and highlights
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    <p className="text-white font-medium">Secondary Color</p>
                    <p className="text-white/80 text-sm">
                      Used for text and subtle elements
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    <p className="text-white font-medium">Accent Color</p>
                    <p className="text-white/80 text-sm">
                      Used for success states and highlights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Font Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="fontFamily">Primary Font</Label>
                  <select
                    id="fontFamily"
                    value={settings.primaryFont}
                    onChange={(e) =>
                      updateSetting("primaryFont", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Used for headings and body text
                  </p>
                </div>

                <div>
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <select
                    id="headingFont"
                    value={settings.headingFont}
                    onChange={(e) =>
                      updateSetting("headingFont", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Used for page titles and headings
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseFontSize">Base Font Size</Label>
                    <select
                      id="baseFontSize"
                      value={settings.baseFontSize}
                      onChange={(e) =>
                        updateSetting("baseFontSize", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="14">14px</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lineHeight">Line Height</Label>
                    <select
                      id="lineHeight"
                      value={settings.lineHeight}
                      onChange={(e) =>
                        updateSetting("lineHeight", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="1.4">1.4</option>
                      <option value="1.5">1.5</option>
                      <option value="1.6">1.6</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="space-y-4"
                  style={{ fontFamily: settings.primaryFont }}
                >
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Heading 1
                    </h1>
                    <p className="text-gray-600">
                      Large page titles and hero headings
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Heading 2
                    </h2>
                    <p className="text-gray-600">
                      Section titles and card headers
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Heading 3
                    </h3>
                    <p className="text-gray-600">
                      Subsection titles and product names
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-900">
                      This is body text that will be used throughout the
                      marketplace for product descriptions, content, and general
                      information.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      This is small text used for captions, metadata, and
                      secondary information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Layout Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Container Width</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(["standard", "wide", "full"] as const).map((width) => (
                      <button
                        key={width}
                        onClick={() => updateSetting("containerWidth", width)}
                        className={`p-3 border rounded-lg text-sm ${
                          settings.containerWidth === width
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {width.charAt(0).toUpperCase() + width.slice(1)}
                        <br />
                        <span className="text-xs text-gray-600">
                          {width === "standard"
                            ? "1200px"
                            : width === "wide"
                            ? "1400px"
                            : "100%"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Header Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(["standard", "centered"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => updateSetting("headerStyle", style)}
                        className={`p-3 border rounded-lg text-sm ${
                          settings.headerStyle === style
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                        <br />
                        <span className="text-xs text-gray-600">
                          {style === "standard"
                            ? "Logo + Navigation"
                            : "Logo Center"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Product Grid</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[2, 3, 4, 5].map((cols) => (
                      <button
                        key={cols}
                        onClick={() =>
                          updateSetting("productGridColumns", cols)
                        }
                        className={`p-3 border rounded-lg text-sm ${
                          settings.productGridColumns === cols
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {cols} Cols
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sticky Header</Label>
                      <p className="text-sm text-gray-600">
                        Header stays visible when scrolling
                      </p>
                    </div>
                    <Switch
                      checked={settings.stickyHeader}
                      onCheckedChange={(checked) =>
                        updateSetting("stickyHeader", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rounded Corners</Label>
                      <p className="text-sm text-gray-600">
                        Use rounded corners for cards and buttons
                      </p>
                    </div>
                    <Switch
                      checked={settings.roundedCorners}
                      onCheckedChange={(checked) =>
                        updateSetting("roundedCorners", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Drop Shadows</Label>
                      <p className="text-sm text-gray-600">
                        Add subtle shadows to elements
                      </p>
                    </div>
                    <Switch
                      checked={settings.dropShadows}
                      onCheckedChange={(checked) =>
                        updateSetting("dropShadows", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Textarea
                    id="footerText"
                    value={settings.footerText}
                    onChange={(e) =>
                      updateSetting("footerText", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Social Links</Label>
                    <p className="text-sm text-gray-600">
                      Display social media icons in footer
                    </p>
                  </div>
                  <Switch
                    checked={settings.showSocialLinks}
                    onCheckedChange={(checked) =>
                      updateSetting("showSocialLinks", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Newsletter Signup</Label>
                    <p className="text-sm text-gray-600">
                      Include email subscription form
                    </p>
                  </div>
                  <Switch
                    checked={settings.showNewsletterFooter}
                    onCheckedChange={(checked) =>
                      updateSetting("showNewsletterFooter", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Payment Methods</Label>
                    <p className="text-sm text-gray-600">
                      Display accepted payment icons
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPaymentMethods}
                    onCheckedChange={(checked) =>
                      updateSetting("showPaymentMethods", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Homepage Tab */}
        <TabsContent value="homepage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hero Slider</CardTitle>
                  <Button onClick={addHeroSlide} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slide
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSlides ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : heroSlides.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      No hero slides yet. Click "Add Slide" to create your first
                      slide.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {heroSlides.map((slide, index) => (
                      <Card key={slide.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                Slide {index + 1}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHeroSlide(slide.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={slide.title}
                                onChange={(e) =>
                                  updateHeroSlide(slide.id, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Hero slide title"
                              />
                            </div>
                            <div>
                              <Label>CTA Button Text</Label>
                              <Input
                                value={slide.ctaText}
                                onChange={(e) =>
                                  updateHeroSlide(slide.id, {
                                    ctaText: e.target.value,
                                  })
                                }
                                placeholder="Shop Now"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Subtitle</Label>
                            <Textarea
                              value={slide.subtitle}
                              onChange={(e) =>
                                updateHeroSlide(slide.id, {
                                  subtitle: e.target.value,
                                })
                              }
                              placeholder="Hero slide subtitle"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>CTA Link</Label>
                              <Input
                                value={slide.ctaLink}
                                onChange={(e) =>
                                  updateHeroSlide(slide.id, {
                                    ctaLink: e.target.value,
                                  })
                                }
                                placeholder="/categories"
                              />
                            </div>
                            <div>
                              <Label>Background Color</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={slide.backgroundColor}
                                  onChange={(e) =>
                                    updateHeroSlide(slide.id, {
                                      backgroundColor: e.target.value,
                                    })
                                  }
                                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                />
                                <Input
                                  value={slide.backgroundColor}
                                  onChange={(e) =>
                                    updateHeroSlide(slide.id, {
                                      backgroundColor: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Text Color</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={slide.textColor}
                                  onChange={(e) =>
                                    updateHeroSlide(slide.id, {
                                      textColor: e.target.value,
                                    })
                                  }
                                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                />
                                <Input
                                  value={slide.textColor}
                                  onChange={(e) =>
                                    updateHeroSlide(slide.id, {
                                      textColor: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Overlay Opacity</Label>
                              <Input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={slide.overlayOpacity}
                                onChange={(e) =>
                                  updateHeroSlide(slide.id, {
                                    overlayOpacity: parseFloat(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Background Image</Label>
                            <div className="flex items-center gap-4 mt-2">
                              {slide.backgroundImage && (
                                <div className="w-20 h-12 border border-gray-300 rounded overflow-hidden">
                                  <img
                                    src={slide.backgroundImage}
                                    alt="Hero background"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleSlideImageUpload(file, slide.id);
                                }}
                                className="hidden"
                                id={`hero-bg-${slide.id}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById(`hero-bg-${slide.id}`)
                                    ?.click()
                                }
                                disabled={uploading === slide.id}
                              >
                                {uploading === slide.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-2" />
                                )}
                                Upload Background
                              </Button>
                              <p className="text-sm text-gray-600">
                                1920x800px recommended
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={slide.isActive}
                                onCheckedChange={(checked) =>
                                  updateHeroSlide(slide.id, {
                                    isActive: checked,
                                  })
                                }
                              />
                              <Label>Active</Label>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Slide {index + 1} of {heroSlides.length}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Show Search Bar</Label>
                    <p className="text-sm text-gray-600">
                      Include search in hero section
                    </p>
                  </div>
                  <Switch
                    checked={settings.showHeroSearch}
                    onCheckedChange={(checked) =>
                      updateSetting("showHeroSearch", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Homepage Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured Categories</Label>
                    <p className="text-sm text-gray-600">
                      Show category grid below hero
                    </p>
                  </div>
                  <Switch
                    checked={settings.showFeaturedCategories}
                    onCheckedChange={(checked) =>
                      updateSetting("showFeaturedCategories", checked)
                    }
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured Products</Label>
                    <p className="text-sm text-gray-600">
                      Display curated product selection
                    </p>
                  </div>
                  <Switch
                    checked={settings.showFeaturedProducts}
                    onCheckedChange={(checked) =>
                      updateSetting("showFeaturedProducts", checked)
                    }
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Top Vendors</Label>
                    <p className="text-sm text-gray-600">
                      Highlight popular vendors
                    </p>
                  </div>
                  <Switch
                    checked={settings.showTopVendors}
                    onCheckedChange={(checked) =>
                      updateSetting("showTopVendors", checked)
                    }
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Testimonials</Label>
                    <p className="text-sm text-gray-600">
                      Customer reviews and feedback
                    </p>
                  </div>
                  <Switch
                    checked={settings.showTestimonials}
                    onCheckedChange={(checked) =>
                      updateSetting("showTestimonials", checked)
                    }
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Newsletter Signup</Label>
                    <p className="text-sm text-gray-600">
                      Email subscription section
                    </p>
                  </div>
                  <Switch
                    checked={settings.showNewsletterSignup}
                    onCheckedChange={(checked) =>
                      updateSetting("showNewsletterSignup", checked)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxFeaturedProducts">
                    Featured Products Count
                  </Label>
                  <select
                    id="maxFeaturedProducts"
                    value={settings.featuredProductsCount}
                    onChange={(e) =>
                      updateSetting(
                        "featuredProductsCount",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                  >
                    <option value="8">8 Products</option>
                    <option value="12">12 Products</option>
                    <option value="16">16 Products</option>
                    <option value="20">20 Products</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/yourpage"
                      value={settings.socialFacebook}
                      onChange={(e) =>
                        updateSetting("socialFacebook", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/yourhandle"
                      value={settings.socialTwitter}
                      onChange={(e) =>
                        updateSetting("socialTwitter", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/yourhandle"
                      value={settings.socialInstagram}
                      onChange={(e) =>
                        updateSetting("socialInstagram", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/company/yourcompany"
                      value={settings.socialLinkedin}
                      onChange={(e) =>
                        updateSetting("socialLinkedin", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="https://youtube.com/yourchannel"
                      value={settings.socialYoutube}
                      onChange={(e) =>
                        updateSetting("socialYoutube", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="https://tiktok.com/@yourhandle"
                      value={settings.socialTiktok}
                      onChange={(e) =>
                        updateSetting("socialTiktok", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
