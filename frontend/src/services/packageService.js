const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

class PackageService {
  static async getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Admin APIs
  static async getAllPackages() {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async createPackage(packageData) {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(packageData)
    });
    return response.json();
  }

  static async updatePackage(id, packageData) {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(packageData)
    });
    return response.json();
  }

  static async deletePackage(id) {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async togglePublished(id) {
    const response = await fetch(`${API_BASE_URL}/packages/${id}/toggle-published`, {
      method: 'POST',
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async getPackageMembers(id, filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/packages/${id}/members?${queryString}`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  // Public APIs
  static async getPublicPackages() {
    const response = await fetch(`${API_BASE_URL}/packages/public`);
    return response.json();
  }

  static async getPackageById(id) {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  // Member Package APIs
  static async getAllMemberPackages(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/member-packages?${queryString}`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async getMemberPackages(memberId) {
    const response = await fetch(`${API_BASE_URL}/member-packages/member/${memberId}`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async getCurrentPackage(memberId) {
    const response = await fetch(`${API_BASE_URL}/member-packages/member/${memberId}/current`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async registerPackage(memberPackageData) {
    const response = await fetch(`${API_BASE_URL}/member-packages/register`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(memberPackageData)
    });
    return response.json();
  }

  static async extendPackage(memberPackageId, extensionData) {
    const response = await fetch(`${API_BASE_URL}/member-packages/${memberPackageId}/extend`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(extensionData)
    });
    return response.json();
  }

  static async cancelPackage(memberPackageId, cancelData) {
    const response = await fetch(`${API_BASE_URL}/member-packages/${memberPackageId}/cancel`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(cancelData)
    });
    return response.json();
  }

  static async getPackageStats() {
    const response = await fetch(`${API_BASE_URL}/member-packages/stats`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }

  static async updateExpiredPackages() {
    const response = await fetch(`${API_BASE_URL}/member-packages/update-expired`, {
      method: 'POST',
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }
}

export default PackageService;