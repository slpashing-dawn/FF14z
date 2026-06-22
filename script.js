
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
            { id: 1, genre: "연성", length: "long", title: "파판즈 타로", date: "2025.05.31", count: "12,581자", body: "캐해석 타로들(@Tarot_Ramia님 스프레드)\n키에르 캐해석 타로\n\n1. 성향 - 검2\n전반적으로 독립적이고, 특정한 편에 휩쓸리려 하지 않는 사람. 신중해서 결정을 빠르게 내리지 않고 오랜 시간 고뇌함. 흔들리지 않고 평온한 편.\n\n2. 처음 상징 - page of wands\n호기심이 많고 활동적이고 어설프지만 열정적인 편. 처음 살던 마을이 워낙 배타적이었던 만큼 마을 안의 것들만을 주로 알지만, 그 바깥의 것도 접하기는 해 궁금증을 품고 더 넓은 세상을 품고자 나옴. 이러한 모험심과 호기심이 처음 상징이었던 듯.\n\n3. 지금 상징 - page of swords 역\n조금 성급한 면이 있다. 가장 앞서 나가고 그 과정에 자신의 몸을 아낌없이 던지다 보니 특히 그런 면이 있는 듯. 이 카드의 정방향이 새로운 시작... 인데, 역방향이 나온 걸 보면 그간 모험을 걸어오고 사람들을 잃다 보니 더이상 잃고 싶지 않아서 막 나서게 된 게 아니었나 싶기도. 다음 카드를 읽어보고 더 보자.\n\n4. 지금의 캐릭터를 만든 방향 - 운명의 수레바퀴 역\n흐름을 상징하는 운명의 수레바퀴가 뒤집혔으니 흐름이 멈춘 거고, 이걸 생의 흐름이 멈추었다고 봐도 괜찮지 않을까... 그렇다면 앞에서 읽은 내용이 맞는 듯. 지키겠다고 했는데도 사람을 잃은 경험이 3번의 상태로 만든 듯.\n\n5. 캐릭터가 버거워 하는 것 - 검 9\n심적인 고통. ...굳이 더 해석할 필요도 없을 듯\n\n6. 본인이 생각하는 캐릭터 - ace of swords\n추진력의 필요성을 상징하는 카드가 나왔다. 앞에서 성향이 균형을 추구하고 좀 불변하는 느낌의 카드가 나왔는데... 더 나서야 한다고 생각하나봐.,..,....무언가를 해내고 있기는 하지만, 조금 더 해야 한다는 느낌. 그래도 이미지가 단단하니 자기가 강하지 못하다고는 생각하지 않는 듯.\n\n7. 타인이 생각하는 캐릭터 - 여제 역\n생각보다... 이미지가 좋지는 않은데? 좀 칼 같다고 여기는 구석이 있나? 더 이상 풍요롭지 않은<<보면 생각보다 키에르를 냉정하다고 보는 사람들이 있나 봄. 하긴 쉽게 보이진 않지... 또 내가 리딩한 카드 이미지 참고해서 보면 고압적인 이미지가 뒤집혀 보이는 것도 같긴 한데, 약간 좀 너무 자의적으로 읽고 있나 싶기는 하다. 딱 카드 해석만 참고해서 보자면 조금 게을러 보인다고도 하니- 모험이나 의뢰 처리하지 않고 쉬는 날이 생각보다 많나 싶기도 함. 하긴 채제작 많이 하니까...\n\n8. 캐릭터의 감정관계 - 절제 역\n절제 역방향...? 키에르가...??? 이걸 어떻게 해석해야 하지\n약간 내가 얘를... 좀 감정 동요가 적고. 그렇게 생각했는데\n적은 게 좀 많이 적나? 싶기도 하다. 사실 키에르가 사회성이나 사교성이 나쁘지 않기는 한데 거... 감정적 교류를 많이 하는가? 하면 솔직히 그건 아니라.\n근데 감정적 교류<<모든 인간관계의 기반. 이다보니... 근데 키에르는 그걸 많이 안 하는 거고? 그러다 보면 절제 역이 말하는 불균형이나 불화가 엿보일수도 있지 않을까.\n혹은 여기서 말하는 게 타인과의 교류가 아니라 자기 자신과의 교류...에 더 가까울 것 같은데 이건 오히려 말이 되는듯. 키에르는 이미 탱커라 맨 앞에 서서 몸을 던지는데 지금 그걸로 충분하지 않다고 생각하고 있는 거니까... 그게 좀 과한 감이 없잖아 있지 않나? 하고 리딩하면서도 생각했고 이 지점을 짚은 거라면 좀 더 말은 되는 듯.\n\n9. 캐릭터 무의식의 기반 - 은둔자 역\n세상으로부터 자신을 너무 많이 고립시켰다. 혹은 숨기는 게 너무 많다. 라는 것인데... \n왜 생각할수록 아젬 설정 풀 때 떠올린 인외적 모멘트<<가 계속 생각나는지 모를 일이다\n아니면 애초에 키에르가 너무 자기 이야기를 안 한다! 는 데에서 시작된 질문으로 타로를 리딩했으니 그 점을 지적하는 걸지도 모르겠다. 사실 그 썰을 푸는 내내 키에르는 굳이 자기 이야기를 해야 하나? 라고 생각할 것 같다고 했는데 그 점이 카드로 이렇게 나온 것 같달까.\n\n10. 캐릭터의 목표 - 동전 4 역\n베푸는 삶인 듯. 동전 사는 무언가를 축적하고 쌓는 그런 건데... 키에르는 그런 타입은 아니기도 하고. 자신이 받은 만큼 세상에 베풀고 돌아가고 싶다, 그런 느낌이다. 무에서 왔으니 무로 돌아가자 싶기도 하고.\n\n11. 이루기 위해 노력하는 것 - 검 8\n검8은 검2와 닮았으면서도 상당히 대조되는데... 검2가 성향에서 나왔다는 점을 생각하면 의미심장하다. 근데 한편 이 카드는 체념이라던가 상황의 수용? 이런 걸 의미하기도 해서... 무언가를 베풀고자 자신이 바라는 바를 포기하는 느낌도 들고. 예컨대 더 많은 사람을 구하기 위해 소중한 사람을 포기한다던가. 사실 그러한 방향을 메인스트림에서 밟아왔기 때문에 그 점이 나타난 게 아닌가 싶기도 하다.\n\n12. 결과 - 태양 역\n위의 것들을 종합해서 어떻게 되었는가, 에 대한 설명을 담은 카드인데... 단순히 말하면 실패임. 아마 지키고자 한 이는 많았으나 다 지키지 못해서 그런 게 아닐까, 싶은... 사실 효월까지 오면서 잃은 사람들이 너무 많아서 그런가. \n\n\n+) 추가 리딩\n1. 효월의 종언 종료 이후 어떻게 될 것인가 - ace of pentacles 역\n부와 풍요가 뒤집어졌으니... 가진 것을 더욱 내놓고 지내나. 아마 종말을 수습하고 이래저래 자신이 지키지 못했던 이들(라자한이라던가) 생각하며 봉사를 다닌다거나 할 것 같다. 아마 후유증을 좀 오래 겪으려는 모양인가 봄.\n\n2. 파판즈(단체)를 어떻게 여기고 있는가 - 동전 2 역\n동전2가 균형을 나타내는데 그게 뒤집어졌으니... 좀 불균형한 상태라고 여기는 듯함. 아무래도 파판즈가 주는 감정의 크기랑 자신이 주는 감정의 크기가 달라서 그런가. .......얘들아내가미안하다\n\n\n\n세랴 캐해석 타로\n\n1. 캐릭터의 성향 - 완드8\n부지런하네요. 방향성도 확실하고... 전반적으로 일처리가 늘어지는 걸 좋아하지 않고. 빠르게 결단을 내려서 무언가를 향하는 듯 합니다. 곧고 단단하고 빠르고 진취적이고. 앞으로 나아가는 사람입니다.\n\n2. 처음 캐릭터 상징 - 소드 킹\n소드 킹 자체는 지적인 명료함, 힘, 규율 등을 의미하는데... 결단력도 있고요. 이슈가르드 출신이라는 점이 드러나는 듯도 하네요. 개인적 해석을 덧붙이자면 어떠한 권위와 규칙과 함께했으나 강한 의지를 함께 가져 그 방향으로 무언가를 발산하는? 그런 느낌도 같이 받아요. 아무튼 이 카드는 세랴의 출신...을 나타내는 게 가장 큰 듯 하지만요.\n\n3. 지금 캐릭터 상징 - 컵5\n뭐지? 세랴도 좀... 후회를 나타내는 그런 카드인데요. 지켜내지 못한 이들을 마음에 담고 있나요? 혹은 잃어버린 이들? 미련이 남는 것들? 개인적으로 효월까지의 이야기만을 알기에 6.0엔딩 시점의 세랴를 생각하며 리딩하고 있긴 합니다만... 그 시점의 세랴는 이랬나요? 부모님이든, 대모님이든, 이젤이든 무언가 마음에 계속 담고 있는 것이 있는 듯 합니다. 그래도 아직 곁에 남은 게 있습니다. 그들은 아직 지킬 수 있고 또 함께할 수 있고... 아직 전부 잃은 게 아니라는 걸 아는 듯 해요. 미련은 있되 지킬 것들이 남았음을 안다, 뭐 그런 느낌이 아닐지.\n\n4. 지금의 캐릭터를 만든 방향 - 여사제 역\n오... 세랴의 서사와 포엠을 생각하면 여러모로 신기한 카드네요. 이런 점을 고려해 여사제의 '역'이라는 점에 집중해서 해석해보자면 종교적인 것에 뭐랄까 심취하지 않는? 얽매이지 않는? 그러한 면이 좀 있는 게 아닌지. 사실 대모님을 잃은 게 이슈가르드의 종교재판으로 인한 것이었어서... 아마 그러한 점을 보여주는 게 아닐까 싶어요. 세랴의 모험이 이슈가르드에서 나옴으로써 시작되었던가요? 확실히 기억나지는 않습니다만(리리님 플필 다시 공개해주시길.), 그러한 일종의 방향성. 따라야 하는 규율 등을 거스르고 모험을 함으로써... 지금의 세랴가 되었다는 걸 보여주는 게 아닌가 싶어요.\n\n5. 캐릭터가 가장 버거워하는 것 - 전차 역\n진전이 없는 것. 제자리에 가만히 있어야 하는 거라던가... 여러모로 고착된 상황, 무엇도 할 수 없는 상태. 이러한 걸 버거워하는 듯 해요. 앞서 성향에서 진취적이고 앞으로 나아가는, 그런 게 나왔죠? 그런 상황과 대조되어서 그런 듯 합니다. 무력한 상황도 별로 좋아하지 않는 것 같다는 생각도 드네요.\n\n6. 본인이 생각하는 캐릭터 - 컵 기사\n괜찮은데요? 생각이 깊고 협조적이고. 뭐랄까 그동안 세랴가 구해 온 사람들이 있다는 걸 확실히 알고 있는 것 같아요. 세랴가 전장에서 어떤 신호로 작용하는지도. 빛의 전사는 희망의 상징이고 사람들에게 승리를 가져오는 존재잖아요? 이러한 점을 알고 있는 것 같아요.\n\n7. 타인이 생각하는 캐릭터 - 완드 기사 역\n조금 극단적이다... 라고 생각하는 사람들도 있긴 한 모양이에요. 경솔하다고 보는 사람들도 있고. 경솔하다기보단 좀... 자신의 뜻에 확고하다? 밀고 나간다? 그런 느낌도 없잖아 있는 모양입니다. 신기하네 이게 맞아요??????? 구라같은데(-.-)\n\n8. 캐릭터의 감정관계 - 완드 퀸\n주도적이고, 직관적이고. 자기 자신을 잘 알고 있는 듯 합니다. 자신감도 있고요. 다른 사람들이 세랴를 좋게 평가하는 것 같아요. 근데 정말 너무... 자기확신? 그런 게 있다. 그런 느낌? 자기 자신을 잘 알고, 그러한 점이 다 반영될 듯 합니다. 단단하네요.\n\n9. 캐릭터 무의식의 기반 - 태양\n태양은 목표달성의 뜻을 가집니다. 그냥 참... 확고한 사람인데요? 줏대 있고 명확하고. 본인이 이루고자 하는 바가 확실히 있고, 그에서 기반했다... 이런 뜻이 아닐까 싶어요.\n\n10. 캐릭터의 목표 - 컵 킹\n다들 괜찮아지길 바라는 것 같아요. 그러니까... 불의하게 죽는 사람이 없고 고통받는 사람이 없고. 그러한 상황이 찾아오길 바라며 그를 위해 적극적으로 움직일 수도 있는? 그걸 처음부터 바랐는지는 모르겠지만, 이왕 어떠한 것이 세상에 이루어져야 한다면 그것은 위에 말한 저런 것이다. 그런 생각을 가진 게 아닌가 싶습니다.\n\n11. 그걸 이루고자 노력하는 것 - 완드9\n힘들지만 해결하는, 이라고 하죠. 그리고 많이 왔습니다. 그래도 항상 경계하고 또 고군분투하고 있죠. 이렇게 말하면 무슨 말인가 싶겠습니다만... 그냥 열심히 노력하고 있다. 가끔 힘들어도 계속 노력한다. 그런 느낌을 받아요. 세랴 열심히 사네요......\n\n12. 결과 - 교황\n여러 이유로 재밌는 카드가 나왔네요. 어쨌든 해석해보자면... 균형이 제대로 갖춰진, 그렇게 완성된 상태입니다. 6.0 종료 시점의 세랴는 어찌되었든 나름의 답을 찾고 완전한 상태가 된 것 같아요. 완전? 이라고 해야할지, 상당히 안정되었다고 해야 할지. 여러모로 괜찮은 결과를 맞이한 듯 해요.\n\n\n\n쿠쉬이 캐해석 타로\n\n1. 캐릭터의 성향 - 매달린 사람\n자원해서 희생하기도 하고... 그렇지만 본인이 원해서 합니다. 희생적인 편이에요. 인내심도 강하고. 성장하기도 합니다. 굉장히 선하다는 생각이 드네요.\n\n2. 처음 캐릭터 상징 - 심판 역\n무소식, 이죠. 가족이 없는 그런 상황을 나타낸 걸까요? 여러모로 부정적인 상황에 처해 있어요. 아무리 생각해봐도 불우했던(...) 과거를 나타내는 카드가 맞는 것 같습니다.\n\n3. 지금 캐릭터 상징 - 검 퀸\n성공했다? 여러모로 좋은 상황이에요. 어딘가에 부딪혀도 다시 일어날 수 있고 단단하게 서 있고. 성장했습니다. 발전했고... 아무래도 모든 모험의 궤적이 쿠쉬이에게는 좋은 성장의 밑거름이 된 것 같은데요? 또 주변(시프라던가)을 통해서도 많이 자란 듯 합니다.\n\n4. 지금의 캐릭터를 만든 방향 - 바보\n바보 카드는 새로운 시작을 의미하죠. 가진 게 없던 상태였지만? 시간이 흐르고 모험의 길을 걸으며 자연스럽게 성장한 편에 가까워 보여요. 메인스트림의 궤적이 쿠쉬이에게 정말 많은 도움이 된 것 같은데요?\n\n5. 캐릭터가 가장 버거워하는 것 - 연인\n여? 기서? 연인 카드가? 나온다고요?\n자.... 카드의 상징을 잘 짚어 보자면\n갈림길, 이기도 하죠? 두 인물의 시선이 맞지 않고 있고요. 아마 이러한 갈등 상황이 가장 힘든 게 아닐까 싶어요. 서로가 추구하는 게 다른데 그 사이에서 무언가를 선택해야 하는 상황. 특히 양 쪽 다 옳아서 그럴 때 더 심할 것 같아요.\n\n6. 본인이 생각하는 캐릭터 - 완드 9\n마냥 순탄한 길을 걸어오지 않았다는 걸 알아요. 그로 인한 흉이 남아있고 그 사실을 알고 있을지도 모르겠습니다. 하지만 그로 인해 넘어지거나 멈추지 않을 것도 알고 있어요. 우와멋있다......\n\n7. 타인이 생각하는 캐릭터 - 컵 기사 역\n조금 더 숙고해라...? 라고 생각하는 게 보이는데요. 몸이 먼저 움직인다고 해야 할지... 좀 앞서가는 편이다? 라고 생각하는 때가 있는 것 같아요. 아니우리애기가그럴수도있지\n\n8. 캐릭터의 감정관계 - 컵 9\n전반적으로 완성된 그런 느낌이네요. 지금의 관계에 만족하고 있고 그래서 상당히 행복한 듯 합니다. 정신적으로 위태롭거나 하는 것 없이 평온하고 안정되어 있어요. 지금의 상태에 만족하고 있기도 합니다.\n\n9. 캐릭터 무의식의 기반 - 완드 4\n기쁨과 활기... 쿠쉬는 배경이 그러함에도 곧게 잘 자랐죠? 그러한 점을 보여주는 게 아닐까 싶어요. 또 애정에 깊은 무게를 주고 있는 것 같아요. 그만큼 시프가 소중할 것도 같네요.\n\n10. 캐릭터의 목표 - 힘\n직관적으로 생각하면 강해지는 것, 좀 더 해석해보자면 그를 통해 불의한 것을 없애는 것이 아닐까 싶습니다. 무언가에 휩쓸리지 않고 곧게 서서 다른 사람들을 보호하고 좀 더 좋은 세상을 만들고자 한다던가요.\n\n11. 그걸 이루고자 노력하는 것 - 검 5 역\n검 5가 상징하는 바가 갈등과 다툼인데 그것의 역방향이니... 쿠쉬는 평화를 가져오고자 늘 노력해온 것 같아요. 갈등을 해소하려고 하고 다툼을 막으려고 하고. 사실 빛의 전사가 늘 보여준 행동이기도 하죠? 그러한 점이 드러나는 듯 합니다.\n\n12. 결과 - 컵 킹\n행복해요!!!!!! 사랑이 가득해요!!!!!!!!!!!\n더 설명할 필요가 있을까요?\n물론 여기 오기까지 격랑이 있었고 마냥 쉬운 길만 있었던 건 아니지만, 이제는 안정을 찾은 듯 합니다. 축하한다.............\n\n\n\n시프 캐해석 타로\n\n\n\n1. 캐릭터의 성향 - 소드 에이스 역\n\n딱히 승부욕 있거나 욕심이 많고 그런 편은 아닙니다. 추진력이 강하거나 하지도 않고요. 차라리 흘러가듯 시류에 몸을 맡기는... 좀 수동적인 편에 가까운 듯도 해요. 막 나서는 편은 아닙니다. 한 가지에 집중하지 못하며 이래저래 신경 쓰는 것도 많은 듯 하고요. 살짝 우유부단한 면도 있는 듯합니다.\n\n2. 처음 캐릭터 상징 - 은둔자\n\n조금 동떨어져 있어요. 정신적인 것에 더 가치를 부여하고... 다른 친구들 타로를 다 과거사랑 연관지어 읽어서 그런가, 시프도 비슷하게 읽히는 것 같다면 착각일까요? 하지만 일단 카드가 이렇게 나왔으니... 시프는 페르시아에서 상당히 귀하게 자랐죠. 그러면서도 그곳에서 나와 모험을 하게 되었고... 이처럼 동떨어지는 면이 은둔자 카드로 드러난 게 아닐까 싶네요. 역시 과거를 나타내는 듯 합니다.\n\n3. 지금 캐릭터 상징 - 전차\n\n앞으로 나아가고 있어요. 모험과 모험에서 만난 사람들이 시프로 하여금 앞으로 나아가게 돕는 듯 합니다. 1번 카드로 시프가 상당히 수동적인 편이라고 했죠? 이제는 그런 모습이 좀 덜해진 것도 같습니다. 그런 시프 옆에는 그와 함께 할 이들이 항상 같이 있고요. 전차는 끌어 주는 말이 있어야 나아가듯, 시프도 끌어 주는 이들이 있어 나아갈 수 있는 듯도 하지만... 시프 본인도 나아간다는 선택을 할 수 있게 된듯 하네요.\n\n\n4. 지금의 캐릭터를 만든 방향 - 힘 역\n\n두려움과 무기력함. 그런 것들이 시프를 짓눌렀나요? 정확히 무엇에서 기인한 감정들인지는 모르겠지만... 그것들이 결국 시프의 등을 밀어주어 지금의 상황이 된 게 아닌가 싶어요.\n\n5. 캐릭터가 가장 버거워하는 것 - 컵 8 역\n\n미련 관련된 카드네요. 여행에서 잃은 이들에 관한 미련일까요? 혹은 미련이 아니라 상황 자체에 대한 고민일지도 모르겠습니다. 지금 가진 게 적지 않고 이룬 것도 많지만... 시프 본인은 현 상황이 제 몫이 아니라 여기는 것도 같습니다. 둘 중 하나일수도, 둘 다일지도 모르겠지만... 일단 이러한 점을 의미하는 걸로 보입니다.\n\n6. 본인이 생각하는 캐릭터 - 별 역\n\n좀 비관적이에요. 너무 이상이 높아 현실을 오히려 비관하는? 그런 면이 보인달까요. 기준이 높은데 그걸 충족시키지 못하는 걸로 보입니다. 허나 별이 착각 또한 의미하는 걸 고려하면 사실 시프 본인은 상당히 좋은 사람인데 자기가 그걸 모르는 걸로 보여요.\n\n7. 타인이 생각하는 캐릭터 - 완드 6\n\n다들 시프를 굉장히 좋게 봐요. 전장에 승리를 가져오는 존재고 자신이 나서야 하는 상황에 나서는 그런 사람. 말 그대로 빛의 전사다운 사람으로 보고 있는 것 같은데요? 파판즈 중에서 이미지가 가장 좋은 것 같습니다.\n\n8. 캐릭터의 감정관계 - 악마\n\n자신을 굉장히 억제하는 느낌이 들어요. 바라는 바를 억누른다던가 하는? 근데 또 갈망하는 게 없는 건 아니거든요. 본인이 억누르고 또 자각을 못해서 그렇지... 전반적으로 불안정한 면도 보입니다. 아직 쿠쉬의 나데나데가 부족했나요?!??? \n\n9. 캐릭터 무의식의 기반 - 여사제 역\n\n이거 세랴에서 나왔던 카드죠! 어라 근데 이게 여기서 나온다고...\n\n일단 페르시아교가 에오르제아에서 사이비(...) 취급을 받을 걸 생각하면 말이 되는 듯도 합니다. 여사제 역방향은 기만적인 것을 의미하기도 하거든요. 시프에게 했던 취급을 생각하면 정말 이게 맞을지도... 그리고 시프는 그곳에서 나고 자랐고 여전히 페르시아교를 믿고 있잖아요? 이러한 점을 나타내는 게 아닐까 싶습니다.\n\n\n10. 캐릭터의 목표 - 완드4 역\n\n무언가 불안정한 느낌인데요. ...혹시 쿠쉬이랑 시프가 우리함께행복해요~ 상태가 된 게 효월 이후 시점인가요? 지금 카드로만 보면 시프가 아직까지는 쿠쉬를 놓아주고 좀 그러는...게...... 본인이 바라는 점인 걸로 보여서요. 아직 불안정하고 그렇기 때문에 마냥 평화나 좋은 것들을 누리기에는 마음에 걸리는 점이 있어 보입니다.\n\n11. 그걸 이루고자 노력하는 것 - 동전7 역\n\n뭔가 이것저것 시도하긴 하는데 효과가 많았을지는 모르겠어요. 여러모로 어리석은 노력을 한 걸로 보이거든요? 노력하겠다고 결심하는 과정 자체에 성급함이 있었고. 사실 10번에서 시프의 목표가 워낙 좀 그렇다(...)보니 이런 카드가 나오는 게 맞는 것 같긴 합니다. 10번 리딩이 제대로 된 게 맞다면요.\n\n12. 결과 - 정의 역\n\n망\n\n했\n\n어\n\n요!\n\n목표? 이뤘을 리 없습니다. 노력을 한다고 했는데 결국 결심도 안 서고 계속 마음은 한 편으로 기울었어요.\n\n근데 그러면 멀어지지 못하고 행복해졌다는 거니까? 오히려 좋아. 가 아닐지...... 아무튼 그렇게됐다.\n\n\n\n\n\n관계성 타로들\n\n\n4인 관계 종합(자작 스프레드)\n\n\n\n1. 현재 이들의 상황 및 분위기 - 검 2\n\n일단 균형은 잘 잡혀 있습니다! 그런데 가끔 갈등이 생기기도 해요. 전반적으로 툰드라 시나리오 때가 생각나는 카드네요. 저희 툰드라 막바지에 좀 싸웠었죠? 그렇게 될 여지가 얼마든지 있어 보입니다. 그 정도의 텐션이 암암리에 잠들어 있지만 그래도 일단은 균형잡혀있는... 그런 느낌으로 보여요.\n\n\n\n2. 과거 이들의 상황 및 분위기 - 완드 8\n\n쭉쭉쭉 잘 나갔습니다. 던전 즈음에서 만났을 때를 생각하며 뽑아서 그런가? 아마 그 이미지가 반영된 것 같아요. 여러모로 합이 잘 맞았네요. '현재'를 6.0완료 시점으로 상정하다보니 그 이전, 한창 멈추지 않고 앞으로 쭉 나아가야 하던 시기를 보여주는 것 같기도 합니다. 아무튼 빠르게 슉슉 목표를 향해 함께 나아가는 그런 상황이었네요!\n\n\n\n3. 미래 이들의 상황 및 분위기 - 동전 2\n\n갈등의 여지라던가 텐션이 완전히 해소되는 건 아닙니다만... 그래도 좀 더 안정적으로 변하네요. 지금보다 훨씬요! 균형 잡힌 상태로, 때로 오르락 내리락 하지만 잘 지내는 그런 상황이 오래토록 이어질 듯 합니다. 굿뉴스네요.\n\n\n\n4. 이들 사이에서 장애물로 작용하는 것 - 여사제 역\n\n솔직하지 못한 점이 가장 큰 장애물 같네요. 몇몇 친구들을 떠올리며... 여기서 더 말할 게 있나요? 아무튼 그러합니다.\n\n\n\n5. 장애물을 극복하는 방식 - 완드 4 역\n\n어라? ...한 번 부딪히나? 정면돌파를 하는 것 같기도 합니다. 이래저래 말다툼을 하든 뭐를 하든 해서 부딪힘으로써 해소하게 될 것 같아요.\n\n\n\n6. A캐릭터가 현재 이들에게 가지는 태도(키에르) - 컵 퀸 역\n\n아...... 확실히 키에르가 아직 파판즈에게 거리감을 가지고 있는 것 같기는 합니다. 자신의 것을 다 오픈하지 않고 감정도 많이 드러내거나 내어주지 않고 있네요.T같으니라고......\n\n\n\n7. A캐릭터가 미래 이들에게 가질 태도 - 검 킹\n\n나이트인데 검의 왕 카드 나온 게 구라같다. 근데 더 웃긴 점: 이 카드가 상징하는 것 중 하나가 리더십 같은 것이며...\n\n아무래도? 탱커로써 제 역할을 제대로 하고 뭐랄까 구심점같은 역할을 해낼 듯 합니다. 혹시라도 싸움이 생겼을 때 중재하는 역할도 하게 될까요? 이 부분은 확신할 수 없습니다만 어쨌거나 파판즈에 곧잘 정착할 것으로 보입니다.\n\n\n\n8. B캐릭터가 현재 이들에게 가지는 태도(세랴) - 검 10\n\n세... 세랴야? 세랴도 쉽지 않은데요??? 가끔 파판즈를 상대하며 지치는 때가 있다던가, 자신의 뜻을 굽히는 때가 있다던가 한 걸로 보입니다. 꽤 많이요.\n\n\n\n9. B캐릭터가 미래 이들에게 가질 태도 - 동전 킹 역\n\n앞에서 갈등이 있고 그렇게 부딪힌 후에 상황이 나아질 것 같다고 했죠? 그 부딪히는 게 세랴가 되지 않을까 싶게 만드는... 그런 카드가 나왔습니다. 그 이후로도 세랴에게는 이 관계가 마냥 순탄하지는 않을 것 같아요...... 일단 카드를 기반으로 보자면요.\n\n\n\n10. C캐릭터가 현재 이들에게 가지는 태도(쿠쉬이) - 완드 9 역\n\n뭔가 이런 해소되지 않은 갈등이 있는 상태...를 어렴풋이라도? 알고 있는 것 같아요. 아니 카드들이 다 왜이래 근데 일단 그렇대요!!!!\n\n\n\n11. C캐릭터가 미래 이들에게 가질 태도 - 컵 4\n\n일단 가지고 있는 것에 만족하고 있네요. 후일 갈등이 해소되고 나면 일단 그거면 족하다, 고 생각하고 있기는 합니다만... 앞쪽 세랴 카드에서 세랴에게는 마냥 순탄치 않다고 했죠? 쿠쉬이가 그 점을 은연중에 알고 있는 듯도 보입니다. 안다고 해야 하나, 무의식중에만 알고 있다고 해야 하나...... \n\n\n\n12. D캐릭터가 현재 이들에게 가지는 태도(시프) - 동전 4 역\n\n시프가 이래저래 파판즈를 위해 많은 걸 노력하고 또 내어주고 있는 걸로 보여요. 꽤 기꺼이요. 그래도 가장 연장자다운 면모가 드러나는 것 같기도 하고... 완충재 역할도 해주고 있나? 싶네요.\n\n\n\n13. D캐릭터가 미래 이들에게 가질 태도 - 심판\n\n기다린 것에 대한 보상을 받네요. 어... 후일 한 번 부딪히고 해소된 상태가 된다고 했죠? 시프는 그 상태에 만족하거나/ 제가 앞서 세랴와 쿠쉬 카드에서 읽은 시점보다 이후에 갈등을 완전히 해소하며 완성된 관계가 될지도 모르겠어요. 사실 이 '미래'는 정확히 어느 시점인지 규정한 채로 리딩한 게 아니라... 각 캐릭터의 '미래'가 서로 다를 수도 있거든요. 아무튼 시프는 후일에도 파판즈와 좋은 관계를 유지하게 될 것 같아요.\n\n\n\n쿠시프 키스 타로(@ b_12_123님 스프레드)\n\n1. 키스하는 계기 - 페이지 컵\n새로운 감정, 순수한, 서툰 감정... 이러한 키워드를 가진 카드입니다.\n네.\n사귀게 되어서? 키스한 게 아닌지.\n\n2. 키스할 때 분위기 - 동전2\n키에르 타로에 나왔던 카드였죠. 다만 이번에는 정방향입니다. 균형이 맞춰져 있는... 아무래도 둘의 마음이 맞아떨어진 듯 합니다. 감정의 크기가 작지는 않아 조금 넘실거립니다만... 그래도 균형이 잘 잡혀 있어요. 분위기 좋네요!\n\n3. 키스 후 분위기 - 태양\n태양... 완성이자 새로운 시작을 의미하죠. 아무래도 사귀게 되어서 기념삼아(?) 키스한 게 맞는 것 같은데요?? 우리 이제 사궈!!!!!!!!!!!!!!! 하는 듯 합니다. 축하드려요. 굉장히 행복하고 또 기뻐 보이네요.\n\n4. 키스할 때 A의 심정(시프) - 막대기4 역\n어라.... 조금 불안함이 보이네요. 왜지? 나이 차이 때문인가? 자기가 어린(...) 쿠쉬를 잡아먹(...)어도 되나 싶은 건가? 다음 카드가 더 걱정이에요.\n\n5. 키스한 후 A의 심정 - 칼3\n왜냐하면 칼3은... 여러모로 부정적인 카드거든요. 연애 초반에 시프가 혹시 좀 죄책감 같은 걸 많이 느꼈나요? 쿠쉬가 너무 아까운 사람이라던가, 내가 이래도 되나 싶은 생각을 했다던가... 그러한 감정이 좀 보이는 것 같아요. 특히 우리 이제 연인이야! 라고 땅땅!! 한 시점이라 더 확 그런 걱정이 몰려온 건가? 싶기도 합니다.\n\n6. 키스할 때 B의 심정(쿠쉬) - 세계\n근데 쿠쉬는 신났어요. 너무 만족하고 있습니다. 목표를 달성했어요 지금 사랑이 완성되었고 참 행복해합니다...... \n\n7. 키스한 뒤 B의 심정 - 검 왕 역\n시프의 저런 마음을 아직 알아채지 못 한 듯 합니다. 아무래도 기쁜 게 앞서는 걸까요...? 아니라면 뒤늦게 알아채고 어라? 하고 있는 상황인 듯도 합니다. \n\n\n+) 확인용 추가리딩\n키스 이후 A와 B가 어떻게 하는지 - 페이지 검\n새로운 시작, 조금 어설프지만 그래도 점차 무언가를 시작하는...\n아마 둘이 잘 풀 듯 하네요. 둘 다 처음인지는 모르겠지만? 관계를 이제 막 시작하면서 조금은 어설프고 서투르더라도 맞춰 나가게 될 듯 하네요. 메데타시!" },
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
                img: "https://i.imgur.com/MaRH1tL.jpeg",
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
                img: "https://i.imgur.com/NF0ajFe.jpeg",
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
                img: "https://i.imgur.com/tmE4I9o.png",
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
        function openQuestModal(name, status, desc, img){
                document.getElementById('modalName').innerText = name;
                document.getElementById('modalStatus').innerText = status;
                document.getElementById('modalDesc').innerText = desc;
                document.getElementById('modalImg').src = img;
                document.getElementById('questModal').classList.add('show');
        }
        function closeQuestModal() {
                document.getElementById('questModal').classList.remove('show');
        }
