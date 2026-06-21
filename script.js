
        // [★ 복사 액션 제어 엔진 함수 이식]
        function copyData(type) {
            const bannerElement = document.getElementById('mainBanner');
            if (!bannerElement) return;
            let copyText = "";

            if (type === 'img') {
                const imgTag = bannerElement.querySelector('img');
                copyText = imgTag ? imgTag.src : "";
            } else if (type === 'url') {
                copyText = bannerElement.href;
            }

            if (copyText && copyText.trim() !== "") {
                navigator.clipboard.writeText(copyText).then(function() {
                    const typeLabel = (type === 'img') ? "📷 배너 이미지 링크" : "🔗 웹페이지 이동 주소";
                    alert(`[에오르제아 통신망] ${typeLabel} 복사가 완료되었습니다.`);
                }).catch(function(err) {
                    alert("주소 복사에 실패했습니다. 브라우저 보안 설정을 확인해 주세요.");
                });
            }
        }


        // [SPA 라우팅 및 엔진 스크립트]
        let currentSlide = 0;
        const totalSlides = 3;
        let autoSlideTimer = null;

        function navigateTo(pageId) {
            if (autoSlideTimer) { clearInterval(autoSlideTimer); autoSlideTimer = null; }

            document.getElementById('ff-dynamic-container').innerHTML = pageTemplates[pageId];
            document.getElementById('ff-page-main-title').innerText = pageId === 'home' ? "EORZEA CHRONICLE ARCHIVE" : "COLLECTED LINKSHELL BANNERS";

            document.querySelectorAll('.ff-menu-btn').forEach(btn => btn.classList.remove('active'));
            const activeMenu = document.getElementById(`menu-${pageId}`);
            if (activeMenu) activeMenu.classList.add('active');

            if (pageId === 'home') {
                currentSlide = 0;
                initSliderTimer();
            }

            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('open')) toggleSidebar();
        }

        window.addEventListener('DOMContentLoaded', () => { 
            navigateTo('home'); 
            
            // 1. 오케스트리온 목록 자동 생성 실행
            initPlaylistUI(); 
            
            // 2. 모그레터 및 방명록 버튼 먹통 해결 (클릭 이벤트 직접 연결)
            document.getElementById('openLetterBtn').onclick = openLetterModal;
            document.getElementById('openGuestbookBtn').onclick = () => openModal('guestbookModal');
        });

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarMask').classList.toggle('show');
        }

        /* =========================================================================
         * [슬라이더 기능 제어 코어]
         * ========================================================================= */
        function updateSliderUI() {
            const wrapper = document.getElementById('sliderWrapper');
            const dots = document.querySelectorAll('.ff-dot');
            if (!wrapper) return;
            
            wrapper.style.transform = "translateX(-" + (currentSlide * 100) + "%)";
            dots.forEach((dot, idx) => {
                if(idx === currentSlide) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }

        function moveSlide(direction) {
            currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
            updateSliderUI();
        }

        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            updateSliderUI();
        }

        function initSliderTimer() {
            autoSlideTimer = setInterval(() => moveSlide(1), 5000);
            const container = document.querySelector('.ff-slider-container');
            if (container) {
                container.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
                container.addEventListener('mouseleave', () => {
                    clearInterval(autoSlideTimer);
                    autoSlideTimer = setInterval(() => moveSlide(1), 5000);
                });
            }
        }

        // =========================================================================
        // [오케스트리온 유튜브 연동 플레이리스트 엔진]
        // =========================================================================
        let isPlaying = false; 
        let currentIdx = 0;
        let repeatMode = "all";
        let player = null;
        let hasStarted = false;

        // ★ [곡수 제한 무제한!] 여기에 형식에 맞춰서 유튜브 ID와 제목을 계속 추가하시면 됩니다!
        const tracks = [ 
            { 
                title: "Night in the Brume", 
                sub: "- Ishgard Theme", 
                ytId: "h4OQDvRBKcE" // 예시: 이슈가르드 밤 테마 유튜브 ID
            }, 
            { 
                title: "Your Answer", 
                sub: "- Hydaelyn Theme", 
                ytId: "adiURkt4Fv4" // 예시: 신생 Answers 유튜브 ID
            }, 
            { 
                title: "Drowning in the Horizon", 
                sub: "- The Azim Steppe Daytime Theme", 
                ytId: "iR3yMqpaCrU" // 예시: 칠흑 테마 유튜브 ID
            },
            
            { 
                title: "Solid", 
                sub: "- Ishgard Theme", 
                ytId: "Kcw8xNxkZtM" // 예시: 칠흑 테마 유튜브 ID
            }
            // { title: "새 곡 제목", sub: "- 부제목", ytId: "유튜브ID" } <-- 이런 식으로 줄바꿈해서 계속 늘릴 수 있어요!
        ];
        
        // 오케스트리온 목록 자동 생성 함수
        function initPlaylistUI() {
            const listContainer = document.querySelector('.ff-track-list');
            if (!listContainer) return;
            
            listContainer.innerHTML = ""; 
            
            tracks.forEach((track, idx) => {
                const li = document.createElement('li');
                li.className = `ff-track-item ${idx === currentIdx ? 'current' : ''}`;
                li.onclick = () => selectTrack(idx);
                
                const trackNum = String(idx + 1).padStart(2, '0');
                li.innerHTML = `<span>${trackNum}. ${track.title}</span><span>${track.sub}</span>`;
                listContainer.appendChild(li);
            });
        }
        // 오케스트리온 UI 토글
        function togglePlaylist() { 
            document.getElementById('playlistPanel').classList.toggle('show'); 
            document.getElementById('listToggleBtn').classList.toggle('active'); 
        }

        // 재생/일시정지 토글 기능 구현
        function togglePlay() {
            if(!player) return;
            const playBtn = 
                document.getElementById('playBtn');
            if(isPlaying){
                player.pauseVideo();
                playBtn.innerText = "PLAY";
                isPlaying = false;
            } else {
                if(!hasStarted){
                    player.loadVideoById(
                        tracks[currentIdx].ytId
                    );
                    hasStarted = true;
                } else {
                    player.playVideo();
                }
                playBtn.innerText = "PAUSE";
                isPlaying = true;
            }
        }

        // 화면 텍스트 및 선택 하이라이트 업데이트
        function updateTrackUI() {
            document.getElementById('currentTitle').innerText = tracks[currentIdx].title;
            document.getElementById('currentSub').innerText = tracks[currentIdx].sub;
            
            document.querySelectorAll('.ff-track-item').forEach((item, idx) => { 
                if(idx === currentIdx) item.classList.add('current'); 
                else item.classList.remove('current'); 
            });

            // 만약 노래가 나오는 중에 다음/이전 곡을 누르면 바로 다음 노래가 이어 나오도록 처리
            if(isPlaying && player){
                player.loadVideoById(
                    tracks[currentIdx].ytId
                );
            }
        }
        function toggleRepeat() {
            const btn =
                document.getElementById(
                    'repeatBtn'
                );
            if(repeatMode === "all"){
                repeatMode = "one";
                btn.innerText = "REPEAT 1";
                btn.classList.add("active");
            } else {
                repeatMode = "all";
                btn.innerText = "REPEAT ALL";
                btn.classList.remove("active");
            }
        }

        function playNext() { currentIdx = (currentIdx + 1) % tracks.length; updateTrackUI(); }
        function playPrev() { currentIdx = (currentIdx - 1 + tracks.length) % tracks.length; updateTrackUI(); }
        function selectTrack(idx) { currentIdx = idx; hasSTarted = true; updateTrackUI(); } //hasstarted

        // 모그레터 랜덤 편지 수납함
        const lettersPool = [
            { title: "[자유부대] 의뢰 관련", body: "다들 잘 지내고 계십니까? 다름이 아니라, 카른의 무너진 사원을 조사해달라는 요청을 받아서 말입니다. 혹시 관심 있으시다면 회신 부탁드립니다.", sender: "키에르 디트-마루크 드림." },
            { title: "[기타] 사람 찾아요~", body: "에렌빌 씨를 분명 드라바니아 어딘가에서 본 것 같은데 잠깐 두목한테 말하러 간 사이 놓쳤네. 위치 구해요! 잡는 거 도와주면 50만 길.", sender: "카디야❤️" }
        ];
        function openLetterModal() {
            const letter = lettersPool[Math.floor(Math.random() * lettersPool.length)];
            document.getElementById('letterContentTarget').innerHTML = `<p><strong>${letter.title}</strong></p><p>${letter.body}</p><p style="text-align:right;">- ${letter.sender}</p>`;
            openModal('letterModal');
        }

        /* 챗지피티랑 수정한 거 */
        
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`모달을 찾을 수 없음: ${modalId}`);
            return;
            }
        modal.classList.add('show');
        }
        
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`모달을 찾을 수 없음: ${modalId}`);
            return;
            }
        modal.classList.remove('show');
        }

    // 챗지피티 유튜브 편집//
    const ytScript = document.createElement('script');
        ytScript.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(ytScript);
        window.onYouTubeIframeAPIReady = function () {
            player = new YT.Player('yt-hidden-player', {
                height:'0',
                width:'0',
                videoId: tracks[0].ytId,
                playerVars:{
                    autoplay:0
                },
                events:{
                    onReady:onPlayerReady,
                    onStateChange:onPlayerStateChange
                }
            });
        };
    function onPlayerReady() {
        const slider =
            document.getElementById(
                'volumeSlider'
            );
        player.setVolume(
            Number(slider.value)
        );
        slider.addEventListener(
            'input',
            function() {
                player.setVolume(
                    Number(this.value)
                );
            }
        );
    }
    function onPlayerStateChange(event) {
        if(event.data === YT.PlayerState.ENDED){
            if(repeatMode === "one"){
                player.loadVideoById(
                    tracks[currentIdx].ytId
                );
            } else {
                currentIdx =
                    (currentIdx + 1) % tracks.length;
                updateTrackUI();
                player.loadVideoById(
                    tracks[currentIdx].ytId
                );
            }
        }
    }
        function loadHome(){
            navigateTo('home');
            document.getElementById('ff-page-main-title').textContent='EORZEA CHRONICLE ARCHIVE';
        }
        
        async function loadPage(filename,title){
    try{
        const response=await fetch(filename);
        const html=await response.text();
        document.getElementById('ff-dynamic-container').innerHTML=html;
        document.getElementById('ff-page-main-title').textContent=title;
                if(filename === 'backup-content.html'){
                    renderList(backupData);
                }
                if(filename === 'gallery-content.html'){
                    renderGallery(galleryData);
                }
    }catch(error){
        console.error(error);
        document.getElementById('ff-dynamic-container').innerHTML='<div class="ff-dashboard-card">페이지를 불러올 수 없습니다.</div>';
    }
}
        // [★] notice 아코디언 토글 핵심 스크립트
        function toggleNotice(id){
            const body=document.getElementById(id);
        
            if(body){
                body.closest('.ff-notice-card')
                    .classList.toggle('active');
            }
        }

    /* 글로그 */
        // 백업 데이터 보관소
        const backupData = [
            { id: 1, genre: "연성", length: "short", title: "어느 푸른 푸줏간의 파수꾼", date: "2026.04.18", count: "3,800자", body: "성도의 밤은 언제나 가혹할 정도로 차가웠다.\n\n외투 깃을 단단히 여미고 주점 선반에 기댄 채, 모험가는 잔에 넘치는 더운 코코아를 내려다보았다. 맞은편에 앉은 기사는 아무런 말도 없이 투구 너머로 조용히 시선을 보낼 뿐이었다.\n\n\"자네가 남겨둔 기록들을 보았네.\"\n이윽고 무거운 철제 갑옷이 스치는 소리와 함께 나직한 음성이 흘러나왔다. 그것은 아주 오래전, 눈보라 속에서 잃어버렸던 누군가의 목소리와 무척이나 닮아 있었다..." },
            { id: 2, genre: "모험일지", length: "short", title: "칠흑 연대기 밀린 서브퀘스트 정산 기록", date: "2026.05.11", count: "2,400자", body: "아므 아랭의 서브 퀘스트들을 드디어 전부 밀어붙였다.\n물류 운송을 돕는 사소한 심부름부터, 잊혀진 광산촌에 남겨진 고대 유물 회수까지. 메인 퀘스트에 치여 미처 보지 못했던 원초세계와 제1세계의 연결고리들이 세밀하게 서술되어 있어 아카이브 수첩에 영구 소장용으로 정리를 결심함쿠포!" },
            { id: 3, genre: "설정집", length: "long", title: "자작 자캐 세계관 및 마력 운용 정밀 설정 모듈", date: "2026.06.01", count: "6,200자", body: "[ 아카이브 고유 자캐 마력 운용 분석표 ]\n\n1. 에테르 순환계의 개요:\n본 캐릭터는 일반적인 흑마법의 파괴적 에테르 방출계와 백마법의 치유적 순환계를 내면에서 동시에 진동시키는 '복합 진동 구조'를 지닌다. 이는 적마도사의 세밀한 펜싱 레이피어 매개체를 통하지 않으면 촉매 폭발을 일으키기 쉽다.\n\n2. 에오르제아 연대기 플롯 분기점:\n신생 에오르제아 시점에서는 그리다니아 환술사 길드에 은거하다가, 창천의 이쉬가르드 종군 기자 기믹으로 격변을 겪은 후 본격적인 마법 융합 연구에 착수하게 되는데...\n\n3. 장문 본문 내부 스크롤 테스트 스냅샷:\n글의 분량이 수천 자에서 수만 자를 가볍게 넘어가더라도, 전체 레이아웃의 바깥쪽 높이는 완벽하게 격리 보존됩니다. 양피지 종이 질감의 내부 뷰어 패널 안쪽에서만 부드럽게 스크롤바가 생성되므로 가독성을 해치지 않으며, 에오르제아 도서관 저널 수첩의 아이덴티티를 훌륭하게 유지합니다." }
        ];

        // 리스트 출력
        function renderList(data) {
            const listContainer = document.getElementById('archiveList');
            listContainer.innerHTML = "";
            if(data.length === 0) {
                listContainer.innerHTML = '<div style="color:#6b5f56; text-align:center; padding:30px; font-size:10pt;">조건에 부합하는 백업물이 없습니다.</div>';
                return;
            }
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = "ff-archive-item";
                card.id = "card-" + item.id;
                card.onclick = () => selectPaper(item);
                card.innerHTML = 
                    '<div class="ff-item-meta"><span>🔮 ' + item.genre + '</span><span class="len-tag">' + item.count + '</span></div>' +
                    '<h3 class="ff-item-title">' + item.title + '</h3>' +
                    '<div class="ff-item-foot"><span>' + item.date + '</span></div>';
                listContainer.appendChild(card);
            });
        }

        // 본문 선택 함수
        function selectPaper(item) {
            document.querySelectorAll('.ff-archive-item').forEach(c => c.classList.remove('selected'));
            document.getElementById('card-' + item.id).classList.add('selected');
            document.getElementById('viewerEmpty').style.display = "none";
            document.getElementById('viewerPaper').style.display = "flex";
            document.getElementById('paperCategory').innerText = "CATEGORY // " + item.genre;
            document.getElementById('paperTitle').innerText = item.title;
            document.getElementById('paperDate').innerText = "📅 " + item.date;
            document.getElementById('paperLen').innerText = "📏 " + item.count;
            document.getElementById('paperBody').innerText = item.body;
            document.getElementById('viewerPaper').scrollTop = 0;
            if(window.innerWidth <= 900){
                document
                    .getElementById('mainViewer')
                    .classList.add('mobile-open');
            
                document
                    .getElementById('archiveList')
                    .style.display = 'none';
            }
        }

        // 실시간 필터 시스템
        function applyFilters() {
            const searchText = document.getElementById('textSearch').value.toLowerCase();
            const genre = document.getElementById('genreFilter').value;
            const length = document.getElementById('lengthFilter').value;
            
            const filtered = backupData.filter(item => {
                const matchText = item.title.toLowerCase().includes(searchText) || item.body.toLowerCase().includes(searchText);
                const matchGenre = (genre === 'all' || item.genre === genre);
                const matchLength = (length === 'all' || item.length === length);
                return matchText && matchGenre && matchLength;
            });
            renderList(filtered);
            document.getElementById('viewerEmpty').style.display = "flex";
            document.getElementById('viewerPaper').style.display = "none";
        }
        function closePaper(){
            document
                .getElementById('mainViewer')
                .classList.remove('mobile-open');
            document
                .getElementById('archiveList')
                .style.display = 'flex';
        }

        // [★ 핵심 개편] 갤러리 미디어 데이터셋 (출처유무, 상세설명, 작가 필드 확장)
        const galleryData = [
            {
                id: 1,
                type: "screenshot",
                tag: "📷 SCREENSHOT",
                title: "쿠가네 하늘",
                date: "2026.04.12",
                img: "https://imgur.com/a/mAfSLRz",
                author: "키에르@초코보",
                source: "", // 출처가 공백이면 출처 버튼 숨김
                description: "청마소크로 졸렬하게 극지붕 성공한 이후."
            },
            {
                id: 2,
                type: "illustration",
                tag: "🎨 ILLUSTRATION",
                title: "시간운명론 키에르",
                date: "2026.05.20",
                img: "https://imgur.com/NF0ajFe",
                author: "키에르@초코보", // 타인 제작물 예시
                source: "", // 출처 링크 입력 시 외부이동 버튼 생성
                description: "님캐들 넣으려다가 하 그래 하면서 내캐넣음"
            },
            {
                id: 3,
                type: "concept",
                tag: "📜 CONCEPT DRAWING",
                title: "출처 버튼 테스트",
                date: "2026.06.02",
                img: "https://imgur.com/tmE4I9o",
                author: "ⓒ 자몽",
                source: "https://crepe.cm/ko/@980819_/4666", // 노션 기록 백업 출처 예시
                description: "제 디코 프사에요 귀엽죠?"
            }
        ];

        // 갤러리 리스트 렌더링 시스템
        function renderGallery(items) {
            const grid = document.getElementById('galleryGrid');
            grid.innerHTML = "";

            if(items.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; color:#6b5f56; text-align:center; padding:50px;">해당 분류에 저장된 미디어 기록이 없습니다.</div>';
                return;
            }

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = "ff-gallery-card";
                card.onclick = () => openLightbox(item);
                card.innerHTML = `
                    <div class="ff-card-thumb-frame">
                        <img src="${item.img}" alt="${item.title}">
                    </div>
                    <div class="ff-card-desc-zone">
                        <div>
                            <div class="ff-card-top-meta">
                                <span class="ff-card-tag">${item.tag}</span>
                                <span class="ff-card-author">${item.author}</span>
                            </div>
                            <h3 class="ff-card-title">${item.title}</h3>
                        </div>
                        <div class="ff-card-date">${item.date}</div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // 카테고리 탭 변경 필터
        function filterGallery(type, btn) {
            document.querySelectorAll('.ff-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if(type === 'all') {
                renderGallery(galleryData);
            } else {
                const filtered = galleryData.filter(d => d.type === type);
                renderGallery(filtered);
            }
        }

        // [★ 기능 확장] 라이트박스 오픈 및 데이터 동적 매핑
        function openLightbox(item) {
            document.getElementById('lbImg').src = item.img;
            document.getElementById('lbTitle').innerText = item.title;
            document.getElementById('lbMeta').innerText = `${item.tag} // ARCHIVE DATE: ${item.date}`;
            document.getElementById('lbAuthor').innerText = `제작 및 소유권 // ${item.author}`;
            document.getElementById('lbDescription').innerText = item.description;

            // 선택형 출처 링크 버튼 가동 처리
            const srcZone = document.getElementById('lbSourceZone');
            if(item.source && item.source.trim() !== "") {
                srcZone.style.display = "block";
                srcZone.innerHTML = `<a href="${item.source}" target="_blank" class="ff-source-btn">🔗 이미지 원본 출처 확인하기 (외부 이동)</a>`;
            } else {
                srcZone.style.display = "none";
                srcZone.innerHTML = "";
            }

            document.getElementById('lightbox').classList.add('show');
        }

        // 라이트박스 클로즈
        function closeLightbox(e) {
            if(e === null || e.target.id === "lightbox" || e.target.className === "ff-lightbox-close") {
                document.getElementById('lightbox').classList.remove('show');
            }
        }
        // 모달창 팝업 제어 (호버 말풍선 강제 억제 포함)
        function openQuestModal(name, status, desc) {
            document.getElementById('modalName').innerText = name;
            document.getElementById('modalStatus').innerText = status;
            document.getElementById('modalDesc').innerText = desc;
            document.getElementById('questModal').classList.add('show');
        }
        function closeQuestModal() {
            document.getElementById('questModal').classList.remove('show');
        }
