package com.commers.ncp_com_web.config;

import com.commers.ncp_com_web.entity.Committee;
import com.commers.ncp_com_web.entity.CommitteeMember;
import com.commers.ncp_com_web.entity.District;
import com.commers.ncp_com_web.entity.ERole;
import com.commers.ncp_com_web.entity.Province;
import com.commers.ncp_com_web.entity.User;
import com.commers.ncp_com_web.entity.Zone;
import com.commers.ncp_com_web.entity.Subject;
import com.commers.ncp_com_web.repository.SubjectRepository;
import com.commers.ncp_com_web.repository.CommitteeMemberRepository;
import com.commers.ncp_com_web.repository.CommitteeRepository;
import com.commers.ncp_com_web.repository.DistrictRepository;
import com.commers.ncp_com_web.repository.ProvinceRepository;
import com.commers.ncp_com_web.repository.UserRepository;
import com.commers.ncp_com_web.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CommitteeRepository committeeRepository;

    @Autowired
    private CommitteeMemberRepository committeeMemberRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Override
    public void run(String... args) throws Exception {
        // Ensure Province exists
        Province province = provinceRepository.findById(1L).orElse(null);
        if (province == null) {
            province = new Province();
            province.setId(1L);
            province.setName("North Central Province");
            province = provinceRepository.save(province);
        }

        // Ensure Anuradhapura & Polonnaruwa districts exist
        if (districtRepository.count() == 0) {
            District anuradhapura = new District();
            anuradhapura.setName("Anuradhapura");
            anuradhapura.setProvince(province);
            districtRepository.save(anuradhapura);

            District polonnaruwa = new District();
            polonnaruwa.setName("Polonnaruwa");
            polonnaruwa.setProvince(province);
            districtRepository.save(polonnaruwa);

            System.out.println(">>> [INIT] Initialized default districts: Anuradhapura & Polonnaruwa.");
        }

        // Ensure Provincial Director user exists with a strong password
        String directorUsername = "provincial_director";
        String directorStrongPassword = "NcpDirector@2026#Secure";

        User director = userRepository.findByUsername(directorUsername).orElse(null);
        if (director == null) {
            director = new User();
            director.setUsername(directorUsername);
            director.setName("Provincial Director");
            director.setEmail("director@ncp.moe.gov.lk");
            director.setPassword(passwordEncoder.encode(directorStrongPassword));
            director.setRole(ERole.ROLE_PROVINCIAL_DIRECTOR);
            director.setProvince(province);
            userRepository.save(director);
            System.out.println(">>> [INIT] Created Provincial Director account: " + directorUsername);
        } else {
            // Update password to the strong password
            director.setPassword(passwordEncoder.encode(directorStrongPassword));
            director.setRole(ERole.ROLE_PROVINCIAL_DIRECTOR);
            director.setProvince(province);
            if (director.getName() == null || director.getName().trim().isEmpty() || director.getName().equals(director.getUsername())) {
                director.setName("Provincial Director");
            }
            userRepository.save(director);
            System.out.println(">>> [INIT] Updated Provincial Director account with strong password");
        }

        // Ensure all existing users have proper names set if empty or set to NIC
        for (User u : userRepository.findAll()) {
            if (u.getName() == null || u.getName().trim().isEmpty() || u.getName().equals(u.getUsername())) {
                if (u.getEmail() != null && u.getEmail().toLowerCase().contains("panchau")) {
                    u.setName("Panchau Bhanu");
                    userRepository.save(u);
                } else if (u.getRole() == ERole.ROLE_PROVINCIAL_DIRECTOR) {
                    u.setName("Provincial Director");
                    userRepository.save(u);
                } else if (u.getRole() == ERole.ROLE_ZONAL_DIRECTOR && u.getZone() != null) {
                    u.setName(u.getZone().getName() + " Zonal Director");
                    userRepository.save(u);
                } else if (u.getRole() == ERole.ROLE_DIVISIONAL_DIRECTOR && u.getDivision() != null) {
                    u.setName(u.getDivision().getName() + " Divisional Director");
                    userRepository.save(u);
                }
            }
        }

        // Initialize default Commerce Subject Development Committees if none exist
        if (committeeRepository.count() == 0) {
            System.out.println(">>> [INIT] Initializing default Subject Development Committees...");

            String[] provincialCommittees = {
                "Provincial Commerce Subject Development Committee",
                "Accounting Curriculum & Assessment Panel",
                "Business Studies Curriculum Committee",
                "Economics Academic & Evaluation Committee",
                "Information & Communication Technology (Commerce) Committee",
                "Entrepreneurship Studies Curriculum Committee"
            };

            for (String cName : provincialCommittees) {
                Committee comm = new Committee();
                comm.setName(cName);
                comm.setType("PROVINCIAL");
                comm = committeeRepository.save(comm);

                // Add provincial director as Chairman/Coordinator in the main committee
                if (cName.equals("Provincial Commerce Subject Development Committee") && director != null) {
                    CommitteeMember member = new CommitteeMember();
                    member.setCommittee(comm);
                    member.setUser(director);
                    member.setPosition("Provincial Director & Chairperson");
                    committeeMemberRepository.save(member);
                }
            }

            // Also seed zonal committees for any zones present
            List<Zone> zones = zoneRepository.findAll();
            for (Zone z : zones) {
                Committee zonalComm = new Committee();
                zonalComm.setName(z.getName() + " Zonal Commerce Committee");
                zonalComm.setType("ZONAL");
                zonalComm.setZone(z);
                committeeRepository.save(zonalComm);
            }
            System.out.println(">>> [INIT] Subject Development Committees initialized successfully.");
        }

        // Initialize or enrich default Commerce subjects with curriculum details
        seedOrEnrichSubjects();
    }

    private void seedOrEnrichSubjects() {
        System.out.println(">>> [INIT] Checking and enriching Commerce subjects directory...");
        List<Subject> predefined = List.of(
            new Subject(null, "Accounting", "AL", "All", "21", "ගිණුම්කරණය", "கணக்கியல்",
                "Core financial accounting principles, partnership accounts, manufacturing accounts, company accounting, auditing, and financial statement analysis.",
                "මූල්‍ය ගිණුම්කරණ මූලධර්ම, හවුල් ව්‍යාපාර, නිෂ්පාදන ගිණුම්, සමාගම් ගිණුම්, විගණනය සහ මූල්‍ය ප්‍රකාශන විශ්ලේෂණය පිළිබඳ පූර්ණ න්‍යායාත්මක හා ප්‍රායෝගික අධ්‍යයනය.",
                "Financial Statements, Cost & Management Accounting, Company Law & Auditing, Ratios & Interpretation",
                "මූල්‍ය ප්‍රකාශන සැකසීම, පිරිවැය හා කළමනාකරණ ගිණුම්කරණය, සමාගම් හා විගණන ප්‍රමිතීන්, මූල්‍ය අනුපාත විශ්ලේෂණය",
                "/slide_1.png", "from-blue-600 to-indigo-700"),

            new Subject(null, "Business Studies", "AL", "All", "22", "ව්‍යාපාර අධ්‍යයනය", "வணிகக் கல்வி",
                "Business environment, commercial law, marketing management, human resources, operations, and modern entrepreneurship dynamics in Sri Lanka.",
                "ව්‍යාපාර පරිසරය, වාණිජ නීතිය, අලෙවිකරණ කළමනාකරණය, මානව සම්පත්, මෙහෙයුම් සහ ශ්‍රී ලංකාවේ නූතන ව්‍යවසායකත්ව ප්‍රවණතා පිළිබඳ හැදෑරීම.",
                "Business Environment, Marketing & Sales, Human Resource Mgmt, Banking & Insurance",
                "ව්‍යාපාර පරිසරය හා නීතිය, අලෙවිකරණ කළමනාකරණය, මානව සම්පත් කළමනාකරණය, බැංකු හා රක්ෂණ සේවා",
                "/commerce_students.jpg", "from-emerald-600 to-teal-700"),

            new Subject(null, "Economics", "AL", "All", "23", "ආර්ථික විද්‍යාව", "பொருளாதாரம்",
                "Microeconomic theory, price mechanism, market structures, macroeconomic stability, fiscal and monetary policies, and international trade in Sri Lanka.",
                "ක්ෂුද්‍ර ආර්ථික විද්‍යාව, මිල යාන්ත්‍රණය, වෙළඳපල ව්‍යුහයන්, සාර්ව ආර්ථික ස්ථාවරත්වය, රාජ්‍ය මූල්‍ය හා මූල්‍ය ප්‍රතිපත්ති සහ ජාත්‍යන්තර වෙළඳාම.",
                "Price Mechanism, National Income Accounting, Fiscal & Monetary Policy, International Trade",
                "මිල යාන්ත්‍රණය හා ඉල්ලුම/සැපයුම, ජාතික ආදායම් ගිණුම්කරණය, මූල්‍ය හා රාජ්‍ය මූල්‍ය ප්‍රතිපත්ති, ජාත්‍යන්තර වෙළඳාම හා විදේශ විනිමය",
                "/slide_2.png", "from-violet-600 to-purple-700"),

            new Subject(null, "Information & Communication Technology (ICT)", "AL", "All", "43", "තොරතුරු හා සන්නිවේදන තාක්ෂණය (ICT)", "தகவல் தொடர்பாடல் தொழில்நுட்பம்",
                "Database management systems, Python programming, computer networking, systems analysis, e-commerce, and business automation technologies.",
                "දත්ත සමුදාය කළමනාකරණය (DBMS), පයිතන් ක්‍රමලේඛනය, ජාලකරණය, පද්ධති විශ්ලේෂණය, ඊ-වාණිජ්‍යය සහ ව්‍යාපාරික ස්වයංක්‍රීයකරණය.",
                "Database Systems (SQL), Python Programming, Networking & Cloud, Web Technologies",
                "දත්ත සමුදාය පද්ධති (SQL), පයිතන් ක්‍රමලේඛනය, පරිගණක ජාලකරණය, වෙබ් තාක්ෂණය හා ඊ-වාණිජ්‍යය",
                "/slide_3.png", "from-cyan-600 to-blue-700"),

            new Subject(null, "Entrepreneurship Studies", "AL", "All", "24", "ව්‍යවසායකත්ව අධ්‍යයනය", "தொழில்முயற்சி கல்வி",
                "Ideation, startup launch, project formulation, venture capital, financial management for SME enterprises, and sustainable innovation.",
                "ව්‍යාපාර අදහස් උත්පාදනය, ආරම්භක ව්‍යාපාර බිහිකිරීම, ව්‍යාපෘති වාර්තාකරණය, සුළු හා මධ්‍ය පරිමාණ මූල්‍යකරණය සහ තිරසර නවෝත්පාදනය.",
                "Business Ideation, Business Plan Formulation, SME Financial Management, Innovation & Growth",
                "ව්‍යාපාර සංකල්ප උත්පාදනය, ව්‍යාපාර සැලසුම් සැකසීම, සුළු හා මධ්‍ය පරිමාණ මූල්‍යකරණය, නවෝත්පාදනය හා ව්‍යාප්තිය",
                "/anuradhapura.png", "from-amber-600 to-orange-700"),

            new Subject(null, "Business Statistics", "AL", "All", "25", "ව්‍යාපාර සංඛ්‍යානය", "வணிகப் புள்ளிவிபரம்",
                "Descriptive statistics, probability distributions, sampling techniques, regression and time-series analysis for business forecasting.",
                "විස්තරාත්මක සංඛ්‍යානය, සම්භාවිතා ව්‍යාප්ති, නියැදි ක්‍රම, ප්‍රතිපායන සහ කාල ශ්‍රේණි විශ්ලේෂණය පිළිබඳ හැදෑරීම.",
                "Descriptive Statistics, Probability Distributions, Sampling Methods, Regression Analysis",
                "විස්තරාත්මක සංඛ්‍යානය, සම්භාවිතා ව්‍යාප්ති, නියැදි ක්‍රමවේද, ප්‍රතිපායන විශ්ලේෂණය",
                "/slide_1.png", "from-rose-600 to-pink-700"),

            new Subject(null, "Commerce & Accounting", "OL", "All", "60", "වාණිජ හා ගිණුම්කරණ අධ්‍යයනය", "வணிகமும் கணக்கீட்டுக் கல்வியும்",
                "Foundational commerce, double-entry bookkeeping, cash book, ledger accounts, and basic final statements for G.C.E. O/L students.",
                "සාමාන්‍ය පෙළ සිසුන් සඳහා මූලික වාණිජ්‍යය, ද්විත්ව සටහන් ක්‍රමය, මුදල් පොත, ලෙජර් ගිණුම් සහ මූලික අවසන් ගිණුම්කරණය.",
                "Foundations of Commerce, Cash Book & Prime Entry, Ledger & Trial Balance, Basic Final Accounts",
                "වාණිජ්‍යයේ පදනම, මුදල් පොත හා මූලික පොත්, ලෙජරය හා ශේෂ පිරික්සුම, මූලික අවසන් ගිණුම්",
                "/slide_1.png", "from-blue-600 to-teal-700"),

            new Subject(null, "Business & Accounting Studies", "OL", "All", "61", "ව්‍යාපාර හා ගිණුම්කරණ අධ්‍යයනය", "வணிகமும் கணக்கீட்டுக் கல்வியும் (O/L)",
                "Elementary business functions, banking procedures, trade transactions, and practical ledger maintenance.",
                "ව්‍යාපාරික කටයුතු, බැංකු කාර්යපටිපාටි, වෙළඳ ගනුදෙනු සහ ප්‍රායෝගික ලෙජර් පවත්වාගෙන යාම පිළිබඳ හැදෑරීම.",
                "Business Functions, Banking Operations, Elementary Bookkeeping, Financial Statements",
                "ව්‍යාපාරික කාර්යයන්, බැංකු මෙහෙයුම්, මූලික පොත් තැබීම, මූල්‍ය ප්‍රකාශන",
                "/commerce_students.jpg", "from-emerald-600 to-teal-700"),

            new Subject(null, "Entrepreneurship Studies (O/L)", "OL", "All", "62", "ව්‍යවසායකත්ව අධ්‍යයනය (සාමාන්‍ය පෙළ)", "தொழில்முயற்சி கல்வி (O/L)",
                "Introduction to entrepreneurial mindset, opportunity recognition, simple market survey, and micro-enterprise operations.",
                "ව්‍යවසායකත්ව ආකල්ප, අවස්ථා හඳුනාගැනීම, සරල වෙළඳපල සමීක්ෂණ සහ ක්ෂුද්‍ර ව්‍යවසාය මෙහෙයුම් පිළිබඳ මූලික හැදෑරීම.",
                "Entrepreneurial Mindset, Opportunity Identification, Simple Business Planning, Record Keeping",
                "ව්‍යවසායකත්ව ආකල්ප, අවස්ථා හඳුනාගැනීම, සරල ව්‍යාපාර සැලසුම්කරණය, සටහන් තබාගැනීම",
                "/anuradhapura.png", "from-amber-600 to-orange-700")
        );

        for (Subject template : predefined) {
            Subject existing = subjectRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(template.getName()) || 
                             (template.getCode() != null && template.getCode().equalsIgnoreCase(s.getCode())))
                .findFirst().orElse(null);

            if (existing == null) {
                subjectRepository.save(template);
            } else {
                boolean changed = false;
                if (existing.getCode() == null || existing.getCode().isEmpty()) {
                    existing.setCode(template.getCode());
                    changed = true;
                }
                if (existing.getNameSi() == null || existing.getNameSi().isEmpty()) {
                    existing.setNameSi(template.getNameSi());
                    changed = true;
                }
                if (existing.getNameTa() == null || existing.getNameTa().isEmpty()) {
                    existing.setNameTa(template.getNameTa());
                    changed = true;
                }
                if (existing.getDescription() == null || existing.getDescription().isEmpty()) {
                    existing.setDescription(template.getDescription());
                    changed = true;
                }
                if (existing.getDescriptionSi() == null || existing.getDescriptionSi().isEmpty()) {
                    existing.setDescriptionSi(template.getDescriptionSi());
                    changed = true;
                }
                if (existing.getModules() == null || existing.getModules().isEmpty()) {
                    existing.setModules(template.getModules());
                    changed = true;
                }
                if (existing.getModulesSi() == null || existing.getModulesSi().isEmpty()) {
                    existing.setModulesSi(template.getModulesSi());
                    changed = true;
                }
                if (existing.getImageUrl() == null || existing.getImageUrl().isEmpty()) {
                    existing.setImageUrl(template.getImageUrl());
                    changed = true;
                }
                if (existing.getColor() == null || existing.getColor().isEmpty()) {
                    existing.setColor(template.getColor());
                    changed = true;
                }
                if (changed) {
                    subjectRepository.save(existing);
                }
            }
        }
        System.out.println(">>> [INIT] Commerce subjects directory successfully initialized & enriched.");
    }
}
