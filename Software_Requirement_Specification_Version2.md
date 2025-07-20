# Software Requirement Specification (SRS)
## Bloodline DNA Testing Service Management System

**Project Code:** WDP392  
**Version:** 1.0  
**Date:** July 20, 2025  
**Organization:** Server-Craftsman Development Team  
**Repository:** server-craftsman/wdp392-restApi-with-nodejs-express-mongodb

---

## DOCUMENT INFORMATION

| Field | Value |
|-------|-------|
| **Project Name** | Bloodline DNA Testing Service Management System |
| **Project Code** | WDP392 |
| **Document Type** | Software Requirement Specification |
| **Version** | 1.0 |
| **Author** | Server-Craftsman Team |
| **Reviewer** | Technical Lead |
| **Approval** | Project Manager |
| **Created Date** | July 20, 2025 |
| **Last Modified** | July 20, 2025 |
| **Status** | Draft |

---

## 1. PROJECT OVERVIEW

### 1.1 Project Background
The Bloodline DNA Testing Service Management System is a comprehensive web-based application designed to manage DNA bloodline testing services for a medical facility. This system facilitates the entire process from appointment booking to result delivery, supporting both civil and administrative DNA testing services.

### 1.2 Project Scope
The system encompasses:
- **Frontend Web Portal**: Customer interface for service booking and result viewing
- **Backend REST API**: Node.js/Express.js with MongoDB database
- **Administrative Dashboard**: Staff and management interface
- **Laboratory Management**: Sample tracking and result processing
- **Reporting System**: Comprehensive analytics and reporting

### 1.3 Technology Stack
- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB
- **Programming Languages**: TypeScript (71.3%), JavaScript (28.3%)
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: JWT-based security
- **File Storage**: Cloud-based storage for reports

### 1.4 Target Users
- **Customers**: Individuals requesting DNA testing services
- **Medical Staff**: Healthcare professionals managing samples
- **Laboratory Technicians**: Personnel conducting DNA tests
- **Administrators**: System managers and facility managers

---

## 2. BUSINESS REQUIREMENTS

### 2.1 Business Objectives
- **Primary Goal**: Digitize and streamline DNA testing service operations
- **Efficiency**: Reduce manual paperwork and processing time by 60%
- **Accuracy**: Minimize human errors in sample tracking and result management
- **Transparency**: Provide real-time status updates to customers
- **Compliance**: Ensure regulatory compliance for medical testing services

### 2.2 Success Criteria
- System processes 100+ appointments per month
- Customer satisfaction rating above 4.5/5.0
- Reduction in processing time from 14 days to 7 days
- Zero data security incidents
- 99.9% system uptime during business hours

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 User Management Module

#### 3.1.1 User Registration and Authentication (UC-001)
**Priority**: High  
**Description**: Users can register, authenticate, and manage their accounts securely.

**Requirements**:
- **FR-001**: System shall allow new user registration with email verification
- **FR-002**: System shall support secure login with email/phone and password
- **FR-003**: System shall implement two-factor authentication (2FA)
- **FR-004**: System shall provide password reset functionality
- **FR-005**: System shall maintain user session management with JWT tokens

#### 3.1.2 Role-Based Access Control (UC-002)
**Priority**: High  
**Description**: System implements comprehensive role-based permissions.

**Requirements**:
- **FR-006**: System shall support four user roles:
  - Customer: Book appointments, view results
  - Staff: Manage appointments, collect samples
  - Laboratory Technician: Process tests, enter results
  - Admin/Manager: Full system access, reporting
- **FR-007**: System shall enforce role-based access to all features
- **FR-008**: System shall maintain audit logs for privileged operations

### 3.2 Service Management Module

#### 3.2.1 Service Configuration (UC-003)
**Priority**: High  
**Description**: Administrators can configure and manage DNA testing services.

**Requirements**:
- **FR-009**: System shall support two service types:
  - Civil DNA Testing: Allows self-collection
  - Administrative DNA Testing: Requires facility collection
- **FR-010**: System shall allow CRUD operations on services
- **FR-011**: System shall support service pricing and duration configuration
- **FR-012**: System shall support image upload for service descriptions
- **FR-013**: System shall maintain service catalog with detailed descriptions

### 3.3 Appointment Management Module

#### 3.3.1 Appointment Booking (UC-004)
**Priority**: High  
**Description**: Customers can book DNA testing appointments online.

**Requirements**:
- **FR-014**: System shall display available time slots
- **FR-015**: System shall allow customers to select services and collection methods
- **FR-016**: System shall support three collection methods:
  - Self-collection at home (civil services only)
  - Collection at medical facility
  - Home collection by staff
- **FR-017**: System shall calculate total cost including taxes and fees
- **FR-018**: System shall send appointment confirmation emails

#### 3.3.2 Appointment Management (UC-005)
**Priority**: High  
**Description**: Staff can manage and track appointment progress.

**Requirements**:
- **FR-019**: System shall support appointment status tracking:
  - Pending → Confirmed → Sample Assigned → Sample Collected → Testing → Completed
- **FR-020**: System shall allow staff to confirm, reschedule, or cancel appointments
- **FR-021**: System shall send automated status update notifications
- **FR-022**: System shall prevent testing without payment confirmation

### 3.4 Payment Processing Module

#### 3.4.1 Payment Management (UC-006)
**Priority**: High  
**Description**: System processes payments for DNA testing services.

**Requirements**:
- **FR-023**: System shall integrate with multiple payment gateways
- **FR-024**: System shall support online payment methods (credit/debit cards, e-wallets)
- **FR-025**: System shall generate electronic invoices
- **FR-026**: System shall track payment status: Pending → Paid → Refunded
- **FR-027**: System shall prevent service delivery without payment confirmation

### 3.5 Sample Management Module

#### 3.5.1 Kit Management (UC-007)
**Priority**: High  
**Description**: System manages DNA testing kit inventory and distribution.

**Requirements**:
- **FR-028**: System shall track kit inventory with unique identifiers
- **FR-029**: System shall manage kit status: Available → Assigned → Used
- **FR-030**: System shall support kit assignment to appointments
- **FR-031**: System shall alert when kit inventory is low
- **FR-032**: System shall track kit shipment to customer addresses

#### 3.5.2 Self-Collection Process (UC-008)
**Priority**: High  
**Description**: Customers can manage self-collection of DNA samples.

**Requirements**:
- **FR-033**: System shall provide detailed collection instructions
- **FR-034**: System shall allow customers to update collection date
- **FR-035**: System shall track sample submission by customers
- **FR-036**: System shall update appointment status when sample is submitted
- **FR-037**: System shall provide return shipping instructions

#### 3.5.3 Facility Collection Process (UC-009)
**Priority**: High  
**Description**: Medical staff collect samples at facility or customer location.

**Requirements**:
- **FR-038**: System shall support sample collection by staff
- **FR-039**: System shall capture multiple sample types (saliva, blood, hair)
- **FR-040**: System shall record person information for each sample
- **FR-041**: System shall immediate update kit status to "Used"
- **FR-042**: System shall support multiple samples per appointment

#### 3.5.4 Laboratory Sample Management (UC-010)
**Priority**: High  
**Description**: Laboratory staff manage received samples and testing process.

**Requirements**:
- **FR-043**: System shall allow staff to confirm sample receipt
- **FR-044**: System shall track sample status: Pending → Submitted → Received → Testing → Completed
- **FR-045**: System shall support sample search by multiple criteria
- **FR-046**: System shall validate sample integrity before testing
- **FR-047**: System shall support batch processing of multiple samples

### 3.6 Testing and Results Module

#### 3.6.1 Testing Process Management (UC-011)
**Priority**: High  
**Description**: Laboratory technicians manage the DNA testing process.

**Requirements**:
- **FR-048**: System shall allow technicians to initiate testing process
- **FR-049**: System shall validate prerequisites before testing:
  - Payment confirmed
  - Sample received and verified
- **FR-050**: System shall support batch testing for efficiency
- **FR-051**: System shall track testing start date and technician assignment
- **FR-052**: System shall send testing started notifications

#### 3.6.2 Result Entry and Management (UC-012)
**Priority**: High  
**Description**: System captures and manages DNA test results.

**Requirements**:
- **FR-053**: System shall capture comprehensive result data:
  - Match status (boolean)
  - Probability percentage
  - Confidence interval
  - Markers tested and matched
  - Confidence level classification
- **FR-054**: System shall automatically generate PDF reports
- **FR-055**: System shall store reports in secure cloud storage
- **FR-056**: System shall regenerate reports when results are updated
- **FR-057**: System shall track result completion date

#### 3.6.3 Result Delivery (UC-013)
**Priority**: High  
**Description**: Customers can access their DNA test results securely.

**Requirements**:
- **FR-058**: System shall allow customers to view results online
- **FR-059**: System shall provide downloadable PDF reports
- **FR-060**: System shall send result ready notifications via email
- **FR-061**: System shall send result update notifications
- **FR-062**: System shall maintain result access history

### 3.7 Administrative Cases Module

#### 3.7.1 Administrative Case Management (UC-014)
**Priority**: Medium  
**Description**: System manages government-mandated DNA testing cases.

**Requirements**:
- **FR-063**: System shall track administrative cases with:
  - Unique case number from government agency
  - Approval code from authorized authority
- **FR-064**: System shall link appointments to administrative cases
- **FR-065**: System shall enforce facility collection for administrative cases
- **FR-066**: System shall maintain compliance audit trail

### 3.8 Website and Content Module

#### 3.8.1 Public Website (UC-015)
**Priority**: Medium  
**Description**: Public-facing website provides information and services.

**Requirements**:
- **FR-067**: System shall provide facility introduction and service information
- **FR-068**: System shall display service catalog with pricing
- **FR-069**: System shall include educational blog about DNA testing
- **FR-070**: System shall provide testing guidelines and instructions
- **FR-071**: System shall support responsive design for mobile devices

### 3.9 Review and Feedback Module

#### 3.9.1 Customer Feedback System (UC-016)
**Priority**: Low  
**Description**: Customers can rate and review services.

**Requirements**:
- **FR-072**: System shall allow customers to rate services (1-5 stars)
- **FR-073**: System shall support detailed written feedback
- **FR-074**: System shall display average ratings for services
- **FR-075**: System shall allow administrators to manage reviews

### 3.10 User Profile and History Module

#### 3.10.1 Profile Management (UC-017)
**Priority**: Medium  
**Description**: Users can manage their profiles and view history.

**Requirements**:
- **FR-076**: System shall allow users to update personal information
- **FR-077**: System shall display appointment history with status
- **FR-078**: System shall maintain complete transaction history
- **FR-079**: System shall support profile privacy settings

### 3.11 Dashboard and Reporting Module

#### 3.11.1 Administrative Dashboard (UC-018)
**Priority**: High  
**Description**: Comprehensive dashboard for system management.

**Requirements**:
- **FR-080**: System shall provide executive dashboard with:
  - Appointment statistics by status
  - Revenue analytics by time period
  - Testing completion metrics
  - User registration trends
- **FR-081**: System shall support real-time data visualization
- **FR-082**: System shall provide drill-down capabilities

#### 3.11.2 Reporting System (UC-019)
**Priority**: Medium  
**Description**: Generate comprehensive reports for business analysis.

**Requirements**:
- **FR-083**: System shall generate reports by:
  - Time period (daily, weekly, monthly, yearly)
  - Service type and category
  - Customer demographics
  - Revenue and financial metrics
- **FR-084**: System shall export reports in multiple formats (PDF, Excel, CSV)
- **FR-085**: System shall support scheduled report generation
- **FR-086**: System shall maintain report access logs

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance Requirements

#### 4.1.1 Response Time
- **NFR-001**: System shall respond to 95% of API requests within 2 seconds
- **NFR-002**: System shall load web pages within 3 seconds on standard broadband
- **NFR-003**: System shall process file uploads within 10 seconds for files up to 10MB

#### 4.1.2 Throughput
- **NFR-004**: System shall support 1000 concurrent users
- **NFR-005**: System shall process 100 appointments per hour during peak times
- **NFR-006**: System shall handle 10,000 database transactions per minute

### 4.2 Security Requirements

#### 4.2.1 Data Protection
- **NFR-007**: System shall encrypt all sensitive data using AES-256 encryption
- **NFR-008**: System shall use HTTPS for all client-server communication
- **NFR-009**: System shall implement secure password policies (minimum 8 characters, complexity requirements)
- **NFR-010**: System shall comply with healthcare data protection regulations

#### 4.2.2 Access Control
- **NFR-011**: System shall implement role-based access control with principle of least privilege
- **NFR-012**: System shall maintain comprehensive audit logs for all user actions
- **NFR-013**: System shall implement session timeout after 30 minutes of inactivity
- **NFR-014**: System shall support two-factor authentication for privileged accounts

### 4.3 Reliability Requirements

#### 4.3.1 Availability
- **NFR-015**: System shall maintain 99.9% uptime during business hours (8 AM - 6 PM)
- **NFR-016**: System shall support planned maintenance windows outside business hours
- **NFR-017**: System shall provide 24/7 availability for customer result access

#### 4.3.2 Data Integrity
- **NFR-018**: System shall perform daily automated backups
- **NFR-019**: System shall maintain backup retention for 7 years
- **NFR-020**: System shall support point-in-time recovery within 24 hours
- **NFR-021**: System shall implement database transaction integrity with ACID properties

### 4.4 Scalability Requirements

#### 4.4.1 Horizontal Scaling
- **NFR-022**: System architecture shall support horizontal scaling
- **NFR-023**: System shall support load balancing across multiple servers
- **NFR-024**: System shall support database sharding when required

#### 4.4.2 Capacity Planning
- **NFR-025**: System shall accommodate 10x growth in user base within 2 years
- **NFR-026**: System shall support 1TB of data storage with expansion capability
- **NFR-027**: System shall handle seasonal traffic spikes (up to 300% normal load)

### 4.5 Usability Requirements

#### 4.5.1 User Interface
- **NFR-028**: System shall provide intuitive user interface with minimal training required
- **NFR-029**: System shall support responsive design for desktop, tablet, and mobile
- **NFR-030**: System shall achieve accessibility compliance (WCAG 2.1 Level AA)

#### 4.5.2 Language Support
- **NFR-031**: System shall support Vietnamese and English languages
- **NFR-032**: System shall allow dynamic language switching
- **NFR-033**: System shall support right-to-left text rendering if required

### 4.6 Compatibility Requirements

#### 4.6.1 Browser Support
- **NFR-034**: System shall support modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **NFR-035**: System shall maintain 95% functionality on mobile browsers

#### 4.6.2 Integration
- **NFR-036**: System shall provide RESTful APIs for third-party integration
- **NFR-037**: System shall support API versioning for backward compatibility
- **NFR-038**: System shall integrate with common payment gateways (Stripe, PayPal, VNPay)

### 4.7 Maintainability Requirements

#### 4.7.1 Code Quality
- **NFR-039**: System shall maintain code test coverage above 80%
- **NFR-040**: System shall follow TypeScript coding standards
- **NFR-041**: System shall implement comprehensive API documentation

#### 4.7.2 Monitoring
- **NFR-042**: System shall provide real-time monitoring and alerting
- **NFR-043**: System shall maintain application performance monitoring (APM)
- **NFR-044**: System shall implement centralized logging with retention policies

---

## 5. BUSINESS PROCESS WORKFLOWS

### 5.1 Civil DNA Testing (Self-Collection) Workflow
```
1. Customer Registration/Login
2. Service Selection (Civil DNA Testing)
3. Appointment Booking with Self-Collection Option
4. Payment Processing
5. Kit Assignment and Shipping
6. Customer Sample Collection at Home
7. Customer Ships Sample to Laboratory
8. Laboratory Receives and Verifies Sample
9. Testing Process Execution
10. Result Entry and Report Generation
11. Customer Notification and Result Delivery
```

### 5.2 Administrative DNA Testing Workflow
```
1. Customer Registration/Login
2. Service Selection (Administrative DNA Testing)
3. Administrative Case Creation
4. Appointment Booking (Facility Collection Only)
5. Payment Processing
6. Sample Collection at Medical Facility
7. Laboratory Testing Process
8. Result Entry and Official Report Generation
9. Result Delivery to Customer and Authorities
```

### 5.3 Facility-Based Collection Workflow
```
1. Customer Appointment Booking
2. Payment Confirmation
3. Sample Collection by Medical Staff (Facility/Home)
4. Immediate Sample Processing
5. Laboratory Testing
6. Result Delivery
```

---

## 6. SYSTEM ARCHITECTURE

### 6.1 High-Level Architecture
```
[Frontend Web Application] 
         ↓
[API Gateway/Load Balancer]
         ↓
[Node.js/Express.js Backend]
         ↓
[MongoDB Database] + [File Storage (Cloud)]
```

### 6.2 API Structure
- **Base URL**: `/api/v1/`
- **Authentication**: `/api/auth/`
- **User Management**: `/api/users/`
- **Services**: `/api/service/`
- **Appointments**: `/api/appointment/`
- **Samples**: `/api/sample/`
- **Results**: `/api/result/`
- **Administrative Cases**: `/api/administrative-cases/`
- **Reports**: `/api/reports/`

### 6.3 Database Design
- **Primary Database**: MongoDB
- **Key Collections**: 
  - users, services, appointments
  - samples, results, administrative_cases
  - payments, reviews, audit_logs
- **Indexing Strategy**: Optimized for query performance
- **Data Relationships**: Embedded and referenced documents

---

## 7. TESTING REQUIREMENTS

### 7.1 Testing Strategy
- **Unit Testing**: 80% code coverage minimum
- **Integration Testing**: API endpoint testing
- **End-to-End Testing**: Complete user journey testing
- **Performance Testing**: Load testing for concurrent users
- **Security Testing**: Penetration testing and vulnerability assessment

### 7.2 Test Environments
- **Development**: Local development environment
- **Staging**: Production-like testing environment
- **Production**: Live system with monitoring

---

## 8. DEPLOYMENT AND OPERATIONS

### 8.1 Deployment Architecture
- **Environment**: Cloud-based deployment (AWS/Azure/GCP)
- **Containerization**: Docker containers for consistent deployment
- **Orchestration**: Kubernetes for container management
- **CI/CD**: Automated deployment pipeline

### 8.2 Monitoring and Maintenance
- **System Monitoring**: 24/7 system health monitoring
- **Application Monitoring**: Performance and error tracking
- **Log Management**: Centralized logging with analysis tools
- **Backup Strategy**: Automated daily backups with geographic redundancy

---

## 9. RISK MANAGEMENT

### 9.1 Technical Risks
- **Data Security Breach**: Mitigation through encryption and access controls
- **System Downtime**: Mitigation through redundancy and backup systems
- **Performance Degradation**: Mitigation through monitoring and scaling

### 9.2 Business Risks
- **Regulatory Compliance**: Regular compliance audits and updates
- **Data Loss**: Comprehensive backup and recovery procedures
- **User Adoption**: User training and support programs

---

## 10. PROJECT TIMELINE

### 10.1 Development Phases
- **Phase 1 (Months 1-2)**: Core user management and authentication
- **Phase 2 (Months 3-4)**: Service and appointment management
- **Phase 3 (Months 5-6)**: Sample management and testing workflow
- **Phase 4 (Months 7-8)**: Results management and reporting
- **Phase 5 (Months 9-10)**: Administrative features and optimization
- **Phase 6 (Months 11-12)**: Testing, deployment, and launch

### 10.2 Milestones
- **M1**: User authentication system complete
- **M2**: Core booking system functional
- **M3**: Sample tracking system operational
- **M4**: Result management system ready
- **M5**: Administrative dashboard complete
- **M6**: System launch and go-live

---

## 11. ACCEPTANCE CRITERIA

### 11.1 Functional Acceptance
- All functional requirements implemented and tested
- User acceptance testing completed successfully
- System integration testing passed
- Performance benchmarks met

### 11.2 Technical Acceptance
- Security audit completed with no critical vulnerabilities
- Load testing validates system can handle required capacity
- Backup and recovery procedures tested and verified
- Documentation complete and approved

---

## 12. APPENDICES

### 12.1 Glossary
- **ADN**: DNA (Acid Deoxyribonucleic)
- **Civil Testing**: Non-legal DNA testing for personal knowledge
- **Administrative Testing**: Legal DNA testing for official purposes
- **Kit**: DNA collection kit containing necessary materials
- **Sample**: Biological specimen collected for testing

### 12.2 References
- Project Repository: https://github.com/server-craftsman/wdp392-restApi-with-nodejs-express-mongodb
- Technical Documentation: Available in project repository
- API Documentation: Swagger/OpenAPI specifications

---

## DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Project Manager** | [To be assigned] | _________________ | ____________ |
| **Technical Lead** | server-craftsman | _________________ | July 20, 2025 |
| **Business Analyst** | [To be assigned] | _________________ | ____________ |
| **Quality Assurance** | [To be assigned] | _________________ | ____________ |

---

**Document Status**: Draft  
**Next Review Date**: August 20, 2025  
**Version Control**: Maintained in project repository  
**Distribution**: Project team, stakeholders, development team

---

*This document is confidential and proprietary to the Server-Craftsman development team and the WDP392 project.*