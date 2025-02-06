export const institutionHandlers = {
    prepareInstitutionsList: (existingInstitutions) => {
      const filteredInstitutions = existingInstitutions.filter(inst => 
        inst && inst.toLowerCase() !== "lainnya"
      );
      return [...filteredInstitutions, "Lainnya"];
    },
  
    handleInstitutionChange: (value, setFormData, setShowNewInstitutionInput, setNewInstitution) => {
      if (value === "Lainnya") {
        setShowNewInstitutionInput(true);
        setFormData(prev => ({ ...prev, institusi: "" }));
      } else {
        setFormData(prev => ({ ...prev, institusi: value }));
        setShowNewInstitutionInput(false);
        setNewInstitution("");
      }
    },
  
    handleNewInstitutionChange: (value, setNewInstitution, setFormData) => {
      setNewInstitution(value);
      setFormData(prev => ({ ...prev, institusi: value }));
    },
  
    validateInstitution: (formData, newInstitution, showNewInstitutionInput) => {
      if (showNewInstitutionInput && !newInstitution.trim()) {
        return { isValid: false, message: 'Nama institusi harus diisi' };
      }
      
      if (!showNewInstitutionInput && !formData.institusi) {
        return { isValid: false, message: 'Silakan pilih institusi' };
      }
  
      return { isValid: true, message: '' };
    }
  };