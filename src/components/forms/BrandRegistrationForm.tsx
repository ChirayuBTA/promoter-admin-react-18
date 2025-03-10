"use client";

import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ValidationErrors {
  name?: string;
  contactPhone?: string;
  contactEmail?: string;
  description?: string;
  website?: string;
}

const BrandRegistrationForm = ({
  initialData,
  onClose,
}: {
  initialData?: any;
  onClose: () => void;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
    website: "",
    createdBy: initialData ? "" : session?.user?.id,
    updatedBy: initialData ? session?.user?.id : "",
  });

  // Prefill the form when initialData is available
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        contactPhone: initialData.contactPhone || "",
        contactEmail: initialData.contactEmail || "",
        description: initialData.description || "",
        website: initialData.website || "",
        createdBy: "",
        updatedBy: session?.user?.id || "",
      });
    }
  }, [initialData, session?.user?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "contactPhone") {
      // Allow only digits and limit to 10 characters
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for this field when user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Brand name is required";
      isValid = false;
    }

    // Validate phone (if provided)
    if (formData.contactPhone && formData.contactPhone.length !== 10) {
      newErrors.contactPhone = "Phone number must be 10 digits";
      isValid = false;
    }

    // Validate email (if provided)
    if (formData.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        newErrors.contactEmail = "Please enter a valid email address";
        isValid = false;
      }
    }

    // Validate website (if provided)
    if (formData.website) {
      // Regex to validate domains with or without http/https protocol
      const urlRegex =
        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/;
      if (!urlRegex.test(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
        isValid = false;
      }
    }

    setErrors(newErrors);

    // For each error, set a timeout to clear it after 10 seconds
    Object.keys(newErrors).forEach((key) => {
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }, 10000);
    });

    return isValid;
  };

  const normalizeUrl = (url: string): string => {
    // If the URL doesn't start with http:// or https://, prepend https://
    if (url && !url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Normalize the website URL before submission
      const normalizedFormData = {
        ...formData,
        website: normalizeUrl(formData.website),
      };

      if (initialData?.id) {
        // Update existing brand
        await api.brand.updateBrandById(initialData.id, normalizedFormData);
      } else {
        // Create a new brand
        await api.brand.createBrand(normalizedFormData);
      }
      onClose(); // Close the dialog after submission
      toast.success(
        `Brand ${initialData ? "Updated" : "Created"} Successfully`,
        { position: "top-center" }
      );
      window.location.reload();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error(`Failed to ${initialData ? "Update" : "Create"} Brand`, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-full min-h-full mx-auto">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label className="mb-2" htmlFor="name">
              Brand Name
            </Label>
            <Input
              id="name"
              name="name"
              onChange={handleChange}
              value={formData.name}
              className={errors.name ? "border-red-500" : "max-w-[50%]"}
              placeholder="Brand Name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="contactPhone">
              Phone Number
            </Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              onChange={handleChange}
              value={formData.contactPhone}
              className={errors.contactPhone ? "border-red-500" : ""}
              placeholder="##########"
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="contactEmail">
              Email ID
            </Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              onChange={handleChange}
              value={formData.contactEmail}
              className={errors.contactEmail ? "border-red-500" : ""}
              placeholder="example@abc.com"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              onChange={handleChange}
              value={formData.description}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label className="mb-2" htmlFor="website">
              Website
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              onChange={handleChange}
              value={formData.website}
              className={errors.website ? "border-red-500" : ""}
              placeholder="website.com or www.website.com"
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer"
          >
            {loading
              ? "Saving..."
              : initialData
              ? "Update Brand"
              : "Register Brand"}
          </Button>
        </form>
      </CardContent>
    </div>
  );
};

export default BrandRegistrationForm;
